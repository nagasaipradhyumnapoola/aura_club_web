"use client";

import { useRef } from "react";
import gsap from "gsap";
import { AuraLogo } from "@/components/aura/AuraLogo";
import { WORDMARK } from "@/lib/utils/paths";
import { layoutRect } from "@/lib/motion/spark";
import { currentScroll, scrollToY, useIsoLayoutEffect, ScrollTrigger } from "@/lib/motion/scroll";

const HEADER_H = 64;

/**
 * The visible AURA name. It sits exactly where the hero wordmark is, then — driven purely by
 * scroll — shrinks and settles in the middle of the top bar, between the spark (left) and the
 * menu / colour switch (right). The hero's own wordmark is only a layout placeholder.
 */
export function DockLogo() {
  const link = useRef<HTMLAnchorElement>(null);

  useIsoLayoutEffect(() => {
    const el = link.current;
    if (!el) return;
    const ease = gsap.parseEase("power2.inOut");
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    let x0 = 0;
    let y0 = 0;
    let w0 = 1;
    let x1 = 0;
    let y1 = 0;
    let w1 = 92;
    let range = 1;
    let last = -1;

    const measure = () => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const hero = document.querySelector<HTMLElement>("[data-logo-wrap]");
      const stage = hero?.closest<HTMLElement>("[data-stage]") ?? null;
      if (hero && stage) {
        const r = layoutRect(hero, stage);
        x0 = r.x;
        y0 = r.y;
        w0 = Math.max(1, r.w);
      } else {
        w0 = Math.min(vw * 0.88, 1180);
        x0 = (vw - w0) / 2;
        y0 = vh * 0.3;
      }
      w1 = vw < 640 ? 74 : 92;
      const h1 = (w1 * WORDMARK.h) / WORDMARK.w;
      x1 = vw / 2 - w1 / 2;
      y1 = (HEADER_H - h1) / 2;
      range = vh * 0.8;
      el.style.width = `${w0}px`;
      last = -1;
    };

    const tick = () => {
      const p = clamp(currentScroll() / range, 0, 1);
      if (p === last) return;
      last = p;
      const e = ease(p);
      const x = x0 + (x1 - x0) * e;
      const y = y0 + (y1 - y0) * e;
      const s = (w0 + (w1 - w0) * e) / w0;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
    };

    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(tick);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(measure);
    return () => {
      ScrollTrigger.removeEventListener("refresh", measure);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <a
      ref={link}
      href="#top"
      className="dock-logo"
      data-cursor="spark"
      aria-label="AURA — back to the top"
      onClick={(e) => {
        e.preventDefault();
        scrollToY(0);
      }}
    >
      <AuraLogo />
    </a>
  );
}
