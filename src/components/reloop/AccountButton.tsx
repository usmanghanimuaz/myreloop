import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useStoreMeta } from "@/lib/reloop/store";

export function AccountButton() {
  const {userId} = useStoreMeta();
  const qc=useQueryClient();
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  async function signIn(provider:"google"|"lovable") {
    setBusy(true);
    try {
      const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin});
      if(result.error) throw result.error;
      setOpen(false);
    } catch(error) { toast.error(error instanceof Error ? error.message : "Sign-in failed"); }
    finally {setBusy(false);}
  }
  async function signOut() {
    setBusy(true);
    try { await qc.cancelQueries(); const {error}=await supabase.auth.signOut(); if(error) throw error; qc.removeQueries({queryKey:["reloop-account"]});qc.removeQueries({queryKey:["photo"]});window.location.assign("/"); }
    catch { toast.error("Could not sign out"); setBusy(false); }
  }
  return <>
    <Button variant="outline" className="w-full" disabled={busy} onClick={()=>userId ? void signOut() : setOpen(true)}>
      {userId ? <><LogOut/> Sign out</> : <><LogIn/> Sign in</>}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader>
      <DialogTitle>Join ReLoop</DialogTitle><DialogDescription>Sign in to share items, post needs and coordinate handovers.</DialogDescription>
    </DialogHeader><Button disabled={busy} onClick={()=>void signIn("google")}>Continue with Google</Button>
      <Button variant="outline" disabled={busy} onClick={()=>void signIn("lovable")}>Continue with Lovable</Button>
    </DialogContent></Dialog>
  </>;
}