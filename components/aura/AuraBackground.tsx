"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SparkShape } from "./SparkShape";
import { WORDMARK } from "@/lib/utils/paths";
import { currentScroll, useIsoLayoutEffect, ScrollTrigger } from "@/lib/motion/scroll";
import { prefersReducedMotion } from "@/lib/motion/media";

/**
 * The quiet environment behind everything: grain, hairline grid, cropped spark outlines,
 * a drifting letter fragment and a live coordinate readout. All of it is secondary.
 */
export function AuraBackground() {
  const root = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-par]"));
    let sections: { top: number; label: string }[] = [];
    let max = 1;
    let last = "";

    const measure = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).map((s) => ({
        top: s.getBoundingClientRect().top + window.scrollY,
        label: s.dataset.section ?? "",
      }));
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);

    const tick = () => {
      const y = currentScroll();
      if (!reduced) {
        for (const l of layers) {
          const sp = parseFloat(l.dataset.par ?? "0");
          const rot = parseFloat(l.dataset.rot ?? "0");
          l.style.transform = `translate3d(0, ${(-y * sp).toFixed(1)}px, 0) rotate(${(y * rot).toFixed(2)}deg)`;
        }
      }
      let label = sections.length ? sections[0].label : "";
      const probe = y + window.innerHeight * 0.45;
      for (const s of sections) if (s.top <= probe) label = s.label;
      const pct = Math.round((y / max) * 100);
      const text = `${label}  ·  ${String(pct).padStart(3, "0")}%`;
      if (coord.current && text !== last) {
        last = text;
        coord.current.textContent = text;
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  }, []);

  const frag = WORDMARK.letters[2];

  return (
    <div ref={root} className="aura-bg" aria-hidden="true">
      <div className="aura-grain" />
      <div className="aura-grid">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div data-par="0.05" data-rot="0.004" className="aura-bg-layer" style={{ right: "-26vw", top: "6vh", width: "84vw" }}>
        <SparkShape outline className="aura-bg-outline" />
      </div>
      <div data-par="0.09" data-rot="-0.003" className="aura-bg-layer" style={{ left: "-34vw", top: "92vh", width: "96vw", transform: "rotate(172deg)" }}>
        <SparkShape outline className="aura-bg-outline" />
      </div>
      <div data-par="0.03" className="aura-bg-layer" style={{ left: "58vw", top: "120vh", width: "34vw" }}>
        <svg viewBox={`0 0 ${WORDMARK.w} ${WORDMARK.h}`} className="aura-bg-frag" focusable="false">
          <path d={frag.d} />
        </svg>
      </div>

      <div ref={coord} className="aura-coord t-mono" />
    </div>
  );
}
