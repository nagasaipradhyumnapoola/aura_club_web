"use client";

import { useRef } from "react";
import gsap from "gsap";
import { site } from "@/data/site";
import { AuraLogo } from "@/components/aura/AuraLogo";
import { anchors } from "@/lib/motion/anchors";
import { useMountEffect, useScene, useSparkTrack } from "@/lib/motion/hooks";
import { prefersReducedMotion } from "@/lib/motion/media";
import { spark, type SparkPose } from "@/lib/motion/spark";
import { ui } from "@/lib/motion/store";

/**
 * Opening: empty space, then the wordmark simply appears — it never moves. Scrolling fades it
 * out and the spark breaks away to guide the rest of the page.
 */
export function IntroSequence() {
  const sec = useRef<HTMLElement>(null);
  const logoWrap = useRef<HTMLDivElement>(null);

  // ----- the spark's first stretch of the journey (scroll driven)
  useSparkTrack("intro", (h) => {
    const s = sec.current;
    const lw = logoWrap.current;
    if (!s || !lw) return [];
    const stage = s.querySelector<HTMLElement>("[data-stage]")!;
    const r = h.rel(lw, stage);
    const rest = {
      x: Math.min(0.94, (r.x + r.w * 0.965) / h.vw),
      y: Math.max(0.1, (r.y - h.vh * 0.045) / h.vh),
    };
    anchors.heroRest = rest;
    const o = h.pinned ? { in: 0, out: 0 } : { in: 0, out: 0.1 };
    const mobile = h.vw < 640;
    return [
      { s: h.at(s, 0, 0, o), ...rest, sc: mobile ? 0.28 : 0.32, r: 0 },
      { s: h.at(s, 0.55, 0, o), x: 0.7, y: 0.62, sc: mobile ? 0.9 : 1.15, r: 12, bend: 0.05 },
      { s: h.at(s, 1, 0, o), x: mobile ? 0.9 : 0.86, y: mobile ? 0.7 : 0.34, sc: mobile ? 1.5 : 2.3, r: -10, bend: -0.04 },
    ];
  });

  // ----- scroll exit
  useScene(
    sec,
    ({ tl, q }) => {
      // nothing moves: the wordmark and its supporting text simply fade as you scroll away
      tl.fromTo(q("[data-logo-wrap]"), { opacity: 1 }, { opacity: 0, ease: "power1.in", duration: 0.7, immediateRender: false }, 0);
      tl.fromTo(q("[data-intro-text]"), { opacity: 1 }, { opacity: 0, ease: "power1.in", duration: 0.45, immediateRender: false }, 0);
      tl.fromTo(q("[data-intro-cue]"), { opacity: 1 }, { opacity: 0, duration: 0.12, immediateRender: false }, 0);
    },
    { in: 0, out: 0.1 },
  );

  // ----- the opening (plays once, opacity only)
  useMountEffect(() => {
    const root = sec.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const dock = root.querySelector<HTMLElement>("[data-logo-wrap]");
    const text = gsap.utils.toArray<HTMLElement>("[data-intro-text]", root);
    const cue = root.querySelector<HTMLElement>("[data-intro-cue]");
    const skip = reduced || window.scrollY > 40 || window.location.hash.length > 1;

    const showFinal = () => {
      gsap.set(dock, { opacity: 1 });
      gsap.set(text, { opacity: 1 });
      gsap.set(cue, { opacity: 1 });
      spark.manual = null;
      ui.set({ introDone: true });
    };

    if (skip) {
      if (reduced) {
        gsap.set([dock, ...text, cue], { opacity: 0 });
        gsap.to(dock, { opacity: 1, duration: 0.9, ease: "power1.out" });
        gsap.to([...text, cue], { opacity: 1, duration: 0.9, delay: 0.3, ease: "power1.out" });
        spark.manual = null;
        ui.set({ introDone: true });
      } else {
        showFinal();
      }
      return () => {
        spark.manual = null;
      };
    }

    spark.rebuild();
    const rest = anchors.heroRest;
    const mobile = document.documentElement.clientWidth < 640;

    const ctx = gsap.context(() => {
      const m: SparkPose = { x: rest.x, y: rest.y, sc: 0.12, r: 0, o: 0, ol: 0, z: "front" };
      spark.manual = m;
      gsap.set([dock, ...text, cue], { opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          spark.manual = null;
          ui.set({ introDone: true });
        },
      });
      tl.to(dock, { opacity: 1, duration: 1.1, ease: "power1.out" }, 0.25);
      if (text[0]) tl.to(text[0], { opacity: 1, duration: 0.9, ease: "power1.out" }, 1.0);
      if (text[1]) tl.to(text[1], { opacity: 1, duration: 0.9, ease: "power1.out" }, 1.3);
      tl.to(m, { o: 1, sc: mobile ? 0.28 : 0.32, duration: 1.1, ease: "power2.out" }, 1.4);
      if (cue) tl.to(cue, { opacity: 1, duration: 0.8, ease: "power1.out" }, 2.1);
    }, root);

    return () => {
      ctx.revert();
      spark.manual = null;
    };
  });

  return (
    <section id="top" ref={sec} data-section="00 / INTRO" className="intro" aria-label="AURA">
      <div data-stage className="intro-stage">
        <div className="intro-center">
          <div data-logo-wrap ref={logoWrap} className="intro-logo">
            <h1 className="sr-only">{`${site.name} — ${site.expansion}`}</h1>
            <AuraLogo className="intro-logo-svg" />
          </div>
          <p data-intro-text className="intro-tagline">
            {site.expansion}
          </p>
          <p data-intro-text className="intro-inst t-mono">
            {site.institution}
          </p>
        </div>
        <div data-intro-cue className="intro-cue t-mono" aria-hidden="true">
          <span>Scroll to enter</span>
          <i />
        </div>
      </div>
    </section>
  );
}
