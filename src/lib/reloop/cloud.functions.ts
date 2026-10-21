import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { CommandSchema, recordsToState, stateRecords, type CloudRecord } from "./cloud-model";
import { createEngine } from "./engine";

export const readPublicRecords = createServerFn({method:"GET"}).handler(async () => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const client = createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth:{persistSession:false,autoRefreshToken:false},
    global:{fetch:(input,init) => {
      const headers = new Headers(init?.headers);
      if(key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey",key); return fetch(input,{...init,headers});
    }},
  });
  const rows: CloudRecord[] = [];
  for(let offset=0;;offset+=1000) {
    const {data,error} = await client.from("reloop_records").select("*").order("key").range(offset,offset+999);
    if(error) throw new Error("Community data could not load. Please try again.");
    rows.push(...data); if(data.length<1000) break;
  }
  return rows;
});

export const readAccountRecords = createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const rows: CloudRecord[]=[];
  for(let offset=0;;offset+=1000) {
    const {data,error}=await context.supabase.from("reloop_records").select("*").order("key").range(offset,offset+999);
    if(error) throw new Error("Your records could not load. Please try again.");
    rows.push(...data); if(data.length<1000) break;
  }
  return {records:rows,userId:context.userId};
});

export const executeCommand = createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth]).inputValidator(input => CommandSchema.parse(input))
  .handler(async ({data:command,context}) => {
    const rows:CloudRecord[]=[];
    for(let offset=0;;offset+=1000) {
      const {data,error}=await context.supabase.from("reloop_records").select("*").order("key").range(offset,offset+999);
      if(error) throw new Error("Could not read your records.");
      rows.push(...data); if(data.length<1000) break;
    }
    const initial=recordsToState(rows);
    const engine=createEngine(initial);
    const owns=(kind:string,id:string) => rows.some(r=>r.kind===kind && !r.sample && r.owner_id===context.userId && (r.data as {id?:string}).id===id);
    if (command.type === "updateListing" || command.type === "deleteListing" || command.type === "setListingStatus") {
      if(!owns("listings",command.id)) throw new Error("Only the listing owner can change it.");
    }
    if(command.type === "markPlanCompleted" || command.type === "deleteImpactEntry") {
      if(!owns("impact",command.id)) throw new Error("Only your own plans can be changed.");
    }
    if(command.type === "sendInterest") {
      const listing=initial.listings.find(l=>l.id===command.id);
      if(!listing || listing.origin === "sample" || listing.status !== "available" || owns("listings",command.id)) throw new Error("Choose an available community listing from another member.");
      if(rows.some(r=>r.kind==="interests" && r.owner_id===context.userId && (r.data as {listingId:string}).listingId===command.id)) throw new Error("You've already sent interest for this listing.");
    }
    const a=engine.actions;
    switch(command.type) {
      case "createListing": a.createListing(command.input); break;
      case "updateListing": a.updateListing(command.id,command.input); break;
      case "deleteListing": a.deleteListing(command.id); break;
      case "setListingStatus": a.setListingStatus(command.id,command.status); break;
      case "sendInterest": a.sendInterest(command.id,command.note); break;
      case "completeAction": a.completeAction(command.id,command.record); break;
      case "reopenAction": a.reopenAction(command.id); break;
      case "planFromFinder": a.planFromFinder(command.entry); break;
      case "markPlanCompleted": a.markPlanCompleted(command.id); break;
      case "deleteImpactEntry": a.deleteImpactEntry(command.id); break;
      case "addNeed": a.addNeed(command.category,command.description); break;
      case "saveEvidence": a.saveEvidence(command.evidence); break;
      case "resetDemo": break;
    }
    const before=stateRecords(initial,context.userId), after=stateRecords(engine.getState(),context.userId);
    const owned=rows.filter(r=>r.owner_id===context.userId && !r.sample);
    const removals=owned.filter(r=> command.type==="resetDemo" || !after.has(r.key)).map(r=>({key:r.key,revision:r.revision}));
    const upserts=command.type==="resetDemo" ? [] : [...after.values()].filter(r=>JSON.stringify(before.get(r.key)?.data)!==JSON.stringify(r.data)).map(r=>{
      const existing=rows.find(x=>x.key===r.key);
      if(existing && existing.owner_id!==context.userId) throw new Error("Only your records can be changed.");
      return {...r,revision:existing?.revision ?? 0};
    });
    // Authenticated and ownership-checked above; this privileged RPC applies the derived patch atomically.
    const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
    const {error}=await supabaseAdmin.rpc("reloop_commit",{actor:context.userId,upserts:JSON.parse(JSON.stringify(upserts)),removals});
    if(error) throw new Error("Couldn't save. The record may have changed; refresh and try again.");
    const listing=command.type==="createListing" ? engine.getState().listings.find(l=>!initial.listings.some(x=>x.id===l.id)) : undefined;
    return {listing};
  });