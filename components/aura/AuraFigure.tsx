"use client";

import { useRef } from "react";
import gsap from "gsap";
import { currentScroll, useIsoLayoutEffect } from "@/lib/motion/scroll";
import { prefersReducedMotion } from "@/lib/motion/media";

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The aura figure, floating in the background of everything after the logo. It fades in as the
 * logo docks, then drifts upward over the whole length of the page (end to end) while bobbing
 * very slightly, like something hovering rather than scrolling.
 */
export function AuraFigure() {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const im = img.current;
    if (!el || !im) return;
    const reduced = prefersReducedMotion();
    let t = 0;
    let rise = 0;
    let vh = window.innerHeight;
    let vw = document.documentElement.clientWidth;
    let max = 1;
    const measure = () => {
      vh = window.innerHeight;
      vw = document.documentElement.clientWidth;
      max = Math.max(1, document.documentElement.scrollHeight - vh);
    };
    measure();
    window.addEventListener("resize", measure);
    const poll = window.setInterval(measure, 2000); // content height settles as fonts/scenes lay out

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(0.1, dtMs / 1000);
      t += dt;
      const y = currentScroll();
      // fade in after the logo has left the hero
      const fade = smooth(vh * 0.3, vh * 1.05, y);
      if (fade <= 0.001) {
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";
      // ease off at the very end so the contact details stay easy to read
      const endDim = 1 - 0.5 * smooth(max - vh * 1.4, max - vh * 0.2, y);
      el.style.opacity = (fade * endDim).toFixed(3);

      // rise: low in the frame at the start of the page, high at the end of it
      const p = Math.min(1, Math.max(0, y / max));
      const target = reduced ? 0 : (0.2 - 0.4 * p) * vh;
      rise += (target - rise) * (1 - Math.exp(-dt * 2.4));
      const bob = reduced ? 0 : Math.sin(t * 0.65) * vh * 0.011;
      const sway = reduced ? 0 : Math.sin(t * 0.42 + 1.3) * vw * 0.006;
      const tilt = reduced ? 0 : Math.sin(t * 0.31) * 0.7;
      const grow = reduced ? 1 : 1 + Math.sin(t * 0.5) * 0.012;
      im.style.transform = `translate3d(${sway.toFixed(2)}px, ${(rise + bob).toFixed(2)}px, 0) rotate(${tilt.toFixed(3)}deg) scale(${grow.toFixed(4)})`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", measure);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div ref={root} className="aura-figure" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} className="aura-figure-img" src="/aura/figure.webp" alt="" decoding="async" draggable={false} />
    </div>
  );
}
