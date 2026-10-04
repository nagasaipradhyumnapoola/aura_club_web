"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SparkShape } from "@/components/aura/SparkShape";
import { useMountEffect } from "@/lib/motion/hooks";
import { prefersReducedMotion } from "@/lib/motion/media";
import type { TeamKey } from "@/lib/validation/application";

const NEXT: Record<TeamKey, string> = {
  technical:
    "If your Technical profile is shortlisted, you will receive a project as the next stage of the selection process.",
  creatives: "Shortlisted Creative applicants will move to an interview.",
  operations: "Shortlisted Operations applicants will move to an interview.",
};

export function ApplicationSuccess({ team, onDone }: { team: TeamKey; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".ok-spark", { scale: 0.2, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: "expo.out" });
      // one small pulse
      tl.to(".ok-spark", { scale: 1.12, duration: 0.28, ease: "power2.out" }, 0.7);
      tl.to(".ok-spark", { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 0.98);
      tl.fromTo(".ok-title .ln-i", { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 0.8, ease: "expo.out" }, 0.45);
      tl.fromTo(".ok-copy > *", { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }, 0.85);
    }, el);
    return () => ctx.revert();
  });

  return (
    <div ref={root} className="ok">
      <SparkShape className="ok-spark" />
      <h2 id="app-title" tabIndex={-1} className="ok-title t-display">
        <span className="ln">
          <span className="ln-i">APPLICATION</span>
        </span>
        <span className="ln">
          <span className="ln-i">RECEIVED.</span>
        </span>
      </h2>
      <div className="ok-copy">
        <p className="ok-lead">Thank you for applying to AURA.</p>
        <p>We will contact shortlisted applicants using the details provided.</p>
        <p>{NEXT[team]}</p>
        <button type="button" className="app-primary" onClick={onDone}>
          <span>RETURN TO AURA</span>
          <span aria-hidden="true" className="app-primary-arrow">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
