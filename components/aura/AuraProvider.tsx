"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger, setLenis, scrollToSection, unlockScroll } from "@/lib/motion/scroll";
import { spark } from "@/lib/motion/spark";
import { prefersReducedMotion } from "@/lib/motion/media";
import { ui, useStore } from "@/lib/motion/store";
import { AuraSpark } from "./AuraSpark";
import { AuraBackground } from "./AuraBackground";
import { AuraFigure } from "./AuraFigure";
import { AuraCursor } from "./AuraCursor";
import { Header } from "@/components/navigation/Header";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";

const ApplicationOverlay = dynamic(
  () => import("@/components/application/ApplicationOverlay").then((m) => m.ApplicationOverlay),
  { ssr: false },
);

export type Theme = "light" | "dark";

type Ctx = {
  theme: Theme;
  toggleTheme: () => void;
  goTo: (id: string) => void;
  openApplication: (origin?: { x: number; y: number }, trigger?: HTMLElement | null) => void;
  closeApplication: () => void;
};

const AuraContext = createContext<Ctx | null>(null);

export function useAura() {
  const c = useContext(AuraContext);
  if (!c) throw new Error("useAura must be used inside <AuraProvider>");
  return c;
}

/** where the application mask should open from, and what to return focus to */
export const applicationLaunch: { origin: { x: number; y: number } | null; trigger: HTMLElement | null } = {
  origin: null,
  trigger: null,
};

export function AuraProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const appOpen = useStore(ui, (s) => s.applicationOpen);
  const [appMounted, setAppMounted] = useState(false);

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setTheme(t === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const next: Theme = html.dataset.theme === "dark" ? "light" : "dark";
    html.classList.add("theme-fade");
    html.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("aura-theme", next);
    } catch {
      /* storage can be blocked; the choice still applies for this visit */
    }
    document
      .querySelector('meta[name="theme-color"]:not([media])')
      ?.setAttribute("content", next === "dark" ? "#0a0a0a" : "#f1eee8");
    window.setTimeout(() => html.classList.remove("theme-fade"), 900);
  }, []);

  const goTo = useCallback((id: string) => {
    const wasOpen = ui.get().menuOpen;
    ui.set({ menuOpen: false });
    // let the menu release its scroll lock first
    if (wasOpen) window.setTimeout(() => scrollToSection(id), 80);
    else scrollToSection(id);
  }, []);

  const openApplication = useCallback((origin?: { x: number; y: number }, trigger?: HTMLElement | null) => {
    applicationLaunch.origin = origin ?? null;
    applicationLaunch.trigger = trigger ?? (document.activeElement as HTMLElement | null);
    setAppMounted(true);
    ui.set({ applicationOpen: true });
  }, []);

  const closeApplication = useCallback(() => ui.set({ applicationOpen: false }), []);

  // smooth inertial scroll + the spark loop share one ticker
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const lenis = new Lenis({
      duration: 1.25,
      smoothWheel: !reduced,
      autoRaf: false,
      anchors: false,
    });
    setLenis(lenis);
    if (process.env.NODE_ENV !== "production") (window as unknown as { gsap?: typeof gsap }).gsap = gsap; // dev: slow-mo debugging
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    const tick = (_t: number, dtMs: number) => {
      spark.tick(dtMs / 1000, lenis.scroll);
      const vh = window.innerHeight;
      ui.set({ headerVisible: ui.get().introDone && lenis.scroll > vh * 0.4 });
    };
    gsap.ticker.add(raf);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => {
      spark.invalidate();
      ScrollTrigger.refresh();
    };
    // any layout refresh (resize, orientation, fonts) re-measures the spark's path
    const onRefresh = () => spark.invalidate();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    // warm the application chunk while the browser is idle so the CTA opens instantly
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const warm = () => void import("@/components/application/ApplicationOverlay");
    const warmId = idle ? idle(warm) : window.setTimeout(warm, 2500);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    const id = window.setTimeout(refresh, 400);

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      if (!idle) window.clearTimeout(warmId);
      window.clearTimeout(id);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      setLenis(null);
      unlockScroll();
    };
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, goTo, openApplication, closeApplication }),
    [theme, toggleTheme, goTo, openApplication, closeApplication],
  );

  return (
    <AuraContext.Provider value={value}>
      <a href="#main" className="skip-link t-mono">
        Skip to content
      </a>
      <AuraBackground />
      <AuraFigure />
      <AuraSpark />
      <Header />
      <MobileNavigation />
      <div id="main" className="aura-content">
        {children}
      </div>
      {(appMounted || appOpen) && <ApplicationOverlay />}
      <AuraCursor />
    </AuraContext.Provider>
  );
}
