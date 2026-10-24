import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useMissionT } from "@/lib/i18n-mission";
import { CARDBOARD_SOURCE, IMAGES } from "@/lib/reloop/images";
import { missionStorageKey } from "@/lib/reloop/mission";
import { dismissMission, readMissionDismissal } from "@/lib/reloop/mission.functions";
import { useStoreMeta } from "@/lib/reloop/store";
import { SitePhoto } from "./SitePhoto";

export function MissionDialog() {
  const { userId, hydrated } = useStoreMeta();
  const t = useMissionT();
  const read = useServerFn(readMissionDismissal);
  const save = useServerFn(dismissMission);
  const [open, setOpen] = useState(false);
  const seen = useRef(new Set<string>());
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const readRef = useRef(read);
  const saveRef = useRef(save);
  readRef.current = read;
  saveRef.current = save;

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const key = missionStorageKey(userId);
    setOpen(false);
    const check = async () => {
      let dismissed = seen.current.has(key);
      try {
        dismissed ||= window.localStorage.getItem(key) === "1";
      } catch {
        /* memory fallback */
      }
      if (userId) {
        try {
          const remote = await readRef.current();
          if (remote.dismissed) {
            dismissed = true;
            seen.current.add(key);
            try {
              window.localStorage.setItem(key, "1");
            } catch {
              /* memory fallback */
            }
          } else if (dismissed) {
            await saveRef.current(); // Retry an earlier device-only dismissal.
          }
        } catch {
          /* Local dismissal still works if offline or account sync fails. */
        }
      }
      if (!active || dismissed) return;
      const show = () => {
        if (!active) return;
        // Do not interrupt an auth, posting or navigation dialog already in use.
        if (document.querySelector('[role="dialog"][data-state="open"]')) {
          timer = setTimeout(show, 1000);
          return;
        }
        previousFocus.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setOpen(true);
      };
      timer = setTimeout(show, 900);
    };
    void check();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [hydrated, userId]);

  const dismiss = () => {
    setOpen(false);
    const key = missionStorageKey(userId);
    seen.current.add(key);
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* Current session remains dismissed. */
    }
    if (userId) void saveRef.current().catch(() => toast.message(t("syncFailed")));
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) dismiss();
      }}
    >
      <DialogContent
        closeLabel={t("close")}
        className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl gap-0 overflow-y-auto rounded-lg p-0 motion-reduce:animate-none"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          titleRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          const target = previousFocus.current;
          if (target?.isConnected) target.focus();
        }}
      >
        <SitePhoto image={IMAGES.cardboardSorting} className="h-36 w-full object-cover sm:h-48" />
        <div className="px-6 py-6 text-start sm:px-8">
          <DialogTitle ref={titleRef} tabIndex={-1} className="text-2xl leading-snug outline-none">
            {t("title")}
          </DialogTitle>
          <p className="mt-3 text-lg font-semibold text-primary">{t("heading")}</p>
          <DialogDescription className="mt-3 leading-relaxed">{t("body")}</DialogDescription>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("modes")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <a
              href={CARDBOARD_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              {t("credit")}
            </a>
            <Button onClick={dismiss}>{t("gotIt")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
