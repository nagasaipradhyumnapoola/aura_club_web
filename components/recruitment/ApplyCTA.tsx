"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useAura } from "@/components/aura/AuraProvider";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";
import { prefersReducedMotion } from "@/lib/motion/media";
import { spark } from "@/lib/motion/spark";

/**
 * The main call to action. On click the spark dives into the button, then the application layer
 * opens through a spark-shaped reveal (see ApplicationOverlay).
 */
export function ApplyCTA() {
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const { openApplication } = useAura();

  useScene(
    wrap,
    ({ tl, q }) => {
      tl.fromTo(q(".cta-label"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
      tl.fromTo(q(".cta-btn .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, stagger: 0.08, duration: 0.3, ease: "power4.out" }, 0.05);
      tl.fromTo(q(".cta-note, .cta-sub"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.3);
    },
    { flow: true, in: 0.9, out: 0.35 },
  );

  useSparkTrack("cta", (h) => {
    const w = wrap.current;
    const b = btn.current;
    if (!w || !b) return [];
    const r = b.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const x = Math.max(0.06, (r.left - 36) / h.vw);
    const m = !h.pinned;
    return [
      { s: top - h.vh * 0.95, x: m ? 0.1 : 0.12, y: 0.5, sc: m ? 0.5 : 0.55, r: -16 },
      { s: top - h.vh * 0.5, x: m ? 0.1 : x, y: 0.5, sc: m ? 0.6 : 0.6, r: -16 },
      { s: top + r.height, x: m ? 0.1 : x, y: 0.5 - r.height / h.vh, sc: m ? 0.6 : 0.6, r: -16 },
    ];
  });

  const launch = () => {
    const el = btn.current;
    if (!el || busy.current) return;
    busy.current = true;
    const r = el.getBoundingClientRect();
    const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    if (prefersReducedMotion()) {
      openApplication(origin, el);
      busy.current = false;
      return;
    }
    // the spark leaves its scroll path, dives to the button, then hands over to the reveal
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const snap = spark.snapshot();
    const m = { x: snap.x, y: snap.y, sc: snap.sc, r: snap.r, o: snap.o, ol: snap.ol, z: "front" as const };
    spark.manual = m;
    gsap.to(m, {
      x: origin.x / vw,
      y: origin.y / vh,
      sc: 0.9,
      r: -18,
      o: 1,
      ol: 0,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        openApplication(origin, el);
        // the reveal now carries the spark's shape; fade the live spark out underneath it
        gsap.to(m, {
          o: 0,
          duration: 0.35,
          ease: "none",
          onComplete: () => {
            spark.manual = null;
            busy.current = false;
          },
        });
      },
    });
  };

  return (
    <div ref={wrap} className="cta" id="apply">
      <p className="cta-label t-mono">05 / APPLY</p>
      <button
        ref={btn}
        type="button"
        className="cta-btn t-display"
        data-cursor="label"
        data-cursor-label="APPLY"
        onClick={launch}
      >
        <span className="ln">
          <span className="ln-i" data-hide>
            APPLY TO <span className="cta-nowrap">AURA<span className="cta-arrow" aria-hidden="true">→</span></span>
          </span>
        </span>
      </button>
      <p className="cta-sub" data-hide>
        Pick the team you want to build with. It takes a few minutes, and your answers are kept while you fill it in.
      </p>
      <p className="cta-note t-mono" data-hide>
        Technical · Creatives · Operations
      </p>
    </div>
  );
}
