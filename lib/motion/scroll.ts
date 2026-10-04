"use client";

import { useEffect, useLayoutEffect } from "react";
import type Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lenisRef: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenisRef = l;
}

export function getLenis() {
  return lenisRef;
}

export function currentScroll() {
  return lenisRef ? lenisRef.scroll : typeof window !== "undefined" ? window.scrollY : 0;
}

export function scrollToY(y: number, opts?: { immediate?: boolean; duration?: number }) {
  if (lenisRef) {
    lenisRef.scrollTo(y, { immediate: opts?.immediate, duration: opts?.duration ?? 1.6, force: true });
  } else {
    window.scrollTo({ top: y, behavior: opts?.immediate ? "auto" : "smooth" });
  }
}

export function scrollToSection(id: string, opts?: { immediate?: boolean }) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY;
  scrollToY(y, opts);
}

export function lockScroll() {
  lenisRef?.stop();
  document.documentElement.classList.add("scroll-locked");
}

export function unlockScroll() {
  lenisRef?.start();
  document.documentElement.classList.remove("scroll-locked");
}

export { gsap, ScrollTrigger };
