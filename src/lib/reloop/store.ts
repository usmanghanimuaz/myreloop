import { createContext, createElement, Suspense, useContext, useEffect, useState, type ReactNode } from "react";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { executeCommand, readAccountRecords, readPublicRecords } from "./cloud.functions";
import { recordsToState, type CloudRecord, type Command } from "./cloud-model";
import { createSeedState } from "./seed";
import type { AppState, Category, DiversionType, Evidence, ListingStatus, Unit } from "./types";
import type { ListingInput } from "./schema";

export const publicRecordsOptions = queryOptions({queryKey:["reloop-public"],queryFn:()=>readPublicRecords(),staleTime:15000});
export interface StoreMeta { hydrated:boolean; storageAvailable:boolean; recoveredFromCorruptData:boolean; userId:string|null; busy:boolean; error:string|null }
const StoreContext=createContext<{state:AppState;meta:StoreMeta}>({state:createSeedState(),meta:{hydrated:false,storageAvailable:true,recoveredFromCorruptData:false,userId:null,busy:false,error:null}});
let dispatch: ((command:Command)=>Promise<{listing?:import("./types").Listing|undefined}>)|undefined;
const send=(command:Command) => dispatch ? dispatch(command) : Promise.reject(new Error("Please wait for ReLoop to load."));
export function useAppState(){return useContext(StoreContext).state;}
export function useStoreMeta(){return useContext(StoreContext).meta;}
export function hydrateStore() { /* Cloud records replace browser-only hydration. */ }

export function CloudStoreProvider({children}:{children:ReactNode}) {
 const {data:publicRows}=useSuspenseQuery(publicRecordsOptions);
 const [userId,setUserId]=useState<string|null>(null);
 const [ready,setReady]=useState(false);
 const queryClient=useQueryClient(); const router=useRouter();
 useEffect(()=>{
  let active=true;
  const refresh=async()=>{const {data}=await supabase.auth.getUser(); if(active){setUserId(data.user?.id??null);setReady(true);}};
  void refresh();
  const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
   if(!["SIGNED_IN","SIGNED_OUT","USER_UPDATED"].includes(event))return;
   if(event==="SIGNED_OUT") {setUserId(null); queryClient.removeQueries({queryKey:["reloop-account"]});}
   else {void refresh(); void queryClient.invalidateQueries({queryKey:["reloop-account"]});}
   void router.invalidate();
  });
  const focus=()=>{void queryClient.invalidateQueries({queryKey:["reloop-public"]});if(userId)void queryClient.invalidateQueries({queryKey:["reloop-account"]});};
  window.addEventListener("focus",focus);
  return ()=>{active=false;subscription.unsubscribe();window.clearInterval(timer);window.removeEventListener("focus",focus);};
 },[queryClient,router,userId]);
 return createElement(Suspense,{fallback:createElement("p",{className:"p-8 text-muted-foreground"},"Loading your saved records…")},
  userId ? createElement(AccountStore,{userId,children}) : createElement(StoreData,{records:publicRows,userId:null,ready,children}));
}
function AccountStore({userId,children}:{userId:string;children:ReactNode}) {
 const read=useServerFn(readAccountRecords);
 const {data}=useSuspenseQuery(queryOptions({queryKey:["reloop-account",userId],queryFn:()=>read(),staleTime:15000}));
 return createElement(StoreData,{records:data.records,userId,ready:true,children});
}
function StoreData({records,userId,ready,children}:{records:CloudRecord[];userId:string|null;ready:boolean;children:ReactNode}) {
 const run=useServerFn(executeCommand); const qc=useQueryClient();
 const mutation=useMutation({mutationFn:run,onSuccess:async()=>{await Promise.all([qc.invalidateQueries({queryKey:["reloop-public"]}),qc.invalidateQueries({queryKey:["reloop-account"]})]);}});
 useEffect(()=>{dispatch=async command=>{if(!userId)throw new Error("Sign in to save or send interest.");return mutation.mutateAsync({data:command});};return()=>{dispatch=undefined;};},[userId,mutation.mutateAsync]);
 const state=recordsToState(records);
 return createElement(StoreContext.Provider,{value:{state,meta:{userId,hydrated:ready,storageAvailable:true,recoveredFromCorruptData:false,busy:mutation.isPending,error:mutation.error?.message??null}}},children);
}

export const actions={
 postNeed:(input:import("zod").infer<typeof import("./schema").NeedInputSchema>)=>send({type:"postNeed",input}),
 closeNeed:(id:string)=>send({type:"closeNeed",id}),
 sendOffer:(id:string,note:string,quantity:number,unit:Unit)=>send({type:"sendOffer",id,note,quantity,unit}),
 respondRequest:(id:string,decision:"accept"|"reject"|"confirm"|"cancel")=>send({type:"respondRequest",id,decision}),
 createListing:async(input:ListingInput)=>(await send({type:"createListing",input})).listing,
 updateListing:(id:string,input:ListingInput)=>send({type:"updateListing",id,input}),
 deleteListing:(id:string)=>send({type:"deleteListing",id}),
 setListingStatus:(id:string,status:ListingStatus)=>send({type:"setListingStatus",id,status}),
 sendInterest:(id:string,note:string)=>send({type:"sendInterest",id,note}),
 completeAction:(id:string,record?:{category:Category;quantity:number;unit:Unit;diversion:DiversionType})=>send({type:"completeAction",id,record}),
 reopenAction:(id:string)=>send({type:"reopenAction",id}),
 planFromFinder:(entry:{category:Category;quantity:number;unit:Unit;diversion:DiversionType;note:string})=>send({type:"planFromFinder",entry}),
 markPlanCompleted:(id:string)=>send({type:"markPlanCompleted",id}),
 deleteImpactEntry:(id:string)=>send({type:"deleteImpactEntry",id}),
 addNeed:(category:Category,description:string)=>send({type:"addNeed",category,description}),
 saveEvidence:(evidence:Evidence)=>send({type:"saveEvidence",evidence}),
 resetDemo:()=>send({type:"resetDemo"}),
};
