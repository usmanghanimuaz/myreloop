import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/lib/reloop/images";

/** Stock media stays illustrative; a failed photo never leaves a blank image frame. */
export function SitePhoto({ image, className, eager = false }: { image: SiteImage; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div role="img" aria-label={image.alt} className={cn("grid place-items-center bg-secondary text-primary", className)}><ImageIcon className="size-8" aria-hidden /></div> : <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className={className} />;
}
