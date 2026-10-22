import { describe,expect,it } from "vitest";
import { CommandSchema, recordsToState, stateRecords, type CloudRecord } from "@/lib/reloop/cloud-model";
import { ListingInputSchema, NeedInputSchema } from "@/lib/reloop/schema";
import { summarizeImpact } from "@/lib/reloop/impact";
const input={title:"Reusable jars",description:"Clean jars",category:"glass",quantity:5,unit:"items",condition:"good",area:"Town centre",mode:"FREE"};
describe("confirmed ReLoop rules",()=>{
 it("allows only FREE and EXCHANGE for listings",()=>{expect(ListingInputSchema.safeParse(input).success).toBe(true);expect(ListingInputSchema.safeParse({...input,mode:"EXCHANGE"}).success).toBe(true);expect(ListingInputSchema.safeParse({...input,mode:"PAID"}).success).toBe(false);});
 it("rejects PAID needs",()=>expect(NeedInputSchema.safeParse({...input,mode:"PAID"}).success).toBe(false));
 it("does not accept single-click exchanged status commands",()=>expect(CommandSchema.safeParse({type:"setListingStatus",id:"x",status:"exchanged"}).success).toBe(false));
 it("excludes self-reported completions from verified impact",()=>{const s=summarizeImpact({actions:[],impact:[{id:"x",source:"finder",sourceId:"x",category:"glass",quantity:5,unit:"items",diversion:"reuse",completed:true,note:"",createdAt:"",origin:"user"}]});expect(s.verified.items).toBe(0);expect(s.verifiedExchanges).toBe(0);});
 it("counts confirmed handovers once and preserves their immutable record key",()=>{const r:CloudRecord={key:"impact:handover:r1",kind:"impact",owner_id:"owner",sample:false,revision:1,data:{id:"handover-r1",source:"exchange",sourceId:"listing",category:"glass",quantity:5,unit:"items",diversion:"reuse",completed:true,note:"Handed over",createdAt:"2026-10-22",origin:"user"}};const state=recordsToState([r,r]);expect(summarizeImpact(state).verified.items).toBe(5);expect(summarizeImpact(state).verifiedExchanges).toBe(1);expect(stateRecords(state,"owner").has(r.key)).toBe(true);});
 it("ignores forged verification flags on ordinary records",()=>{const r:CloudRecord={key:"impact:fake",kind:"impact",owner_id:"owner",sample:false,revision:1,data:{id:"fake",source:"exchange",sourceId:"listing",category:"glass",quantity:5,unit:"items",diversion:"reuse",completed:true,verified:true,note:"",createdAt:"",origin:"user"}};expect(summarizeImpact(recordsToState([r])).verified.items).toBe(0);});
 it("rejects contact details in public titles",()=>expect(ListingInputSchema.safeParse({...input,title:"Contact someone@example.com"}).success).toBe(false));
});