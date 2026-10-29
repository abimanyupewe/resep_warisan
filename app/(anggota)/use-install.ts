"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt(): Promise<void> };

const never = () => () => {};
const standaloneNow = () => matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
type Platform = "ios" | "android" | "desktop";
const platformNow = (): Platform => (/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : /android/i.test(navigator.userAgent) ? "android" : "desktop");
const secureNow = () => window.isSecureContext && location.protocol === "https:";

// Chrome Android menawarkan pemasangan lewat beforeinstallprompt; browser tidak mengizinkan pemasangan tanpa ketukan pengguna.
export function useInstall() {
  const installed = useSyncExternalStore(never, standaloneNow, () => false);
  const platform = useSyncExternalStore<Platform>(never, platformNow, () => "desktop");
  // Chrome hanya menawarkan pemasangan di https; localhost dikecualikan oleh Chrome sendiri.
  const secure = useSyncExternalStore(never, secureNow, () => true);
  const [offer, setOffer] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onOffer = (e: Event) => { e.preventDefault(); setOffer(e as InstallEvent); };
    const onDone = () => setOffer(null);
    window.addEventListener("beforeinstallprompt", onOffer);
    window.addEventListener("appinstalled", onDone);
    return () => { window.removeEventListener("beforeinstallprompt", onOffer); window.removeEventListener("appinstalled", onDone); };
  }, []);

  return { installed, platform, secure, canInstall: !!offer, install: async () => { await offer?.prompt(); setOffer(null); } };
}
