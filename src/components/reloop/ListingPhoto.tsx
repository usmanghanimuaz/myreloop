import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export function ListingPhoto({path,title}:{path:string;title:string}) {
  const {data,isError,refetch}=useQuery({queryKey:["photo",path],queryFn:async()=>{
    const {data,error}=await supabase.storage.from("reloop-photos").createSignedUrl(path,3600);
    if(error) throw error; return data.signedUrl;
  },staleTime:3000000,retry:1});
  return data ? <img src={data} alt={title} className="aspect-[4/3] w-full rounded-lg object-cover"/> : <div className="grid aspect-[4/3] place-items-center bg-muted text-muted-foreground">{isError ? <Button variant="ghost" onClick={()=>void refetch()}>Photo unavailable · Retry</Button> : <ImageIcon aria-label="Photo loading"/>}</div>;
}