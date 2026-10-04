"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SparkShape } from "./SparkShape";
import { hasFinePointer } from "@/lib/motion/media";
import { spark } from "@/lib/motion/spark";
import { useMountEffect } from "@/lib/motion/hooks";

type CursorState = "default" | "link" | "text" | "spark" | "label" | "hide" | "down";

const TEXT_INPUT = /^(text|email|tel|url|search|password|number)$/i;

function stateFor(target: Element | null): { state: CursorState; label: string } {
  if (!target) return { state: "default", label: "" };
  const marked = target.closest<HTMLElement>("[data-cursor]");
  if (marked) {
    const v = marked.dataset.cursor as CursorState;
    return { state: v, label: marked.dataset.cursorLabel ?? "" };
  }
  const t = target.closest("input, textarea, select, a, button, [role='button'], label, summary");
  if (!t) return { state: "default", label: "" };
  if (t instanceof HTMLTextAreaElement) return { state: "text", label: "" };
  if (t instanceof HTMLInputElement) {
    return TEXT_INPUT.test(t.type || "text") ? { state: "text", label: "" } : { state: "link", label: "" };
  }
  return { state: "link", label: "" };
}

/**
 * Pointer: a small dot that changes with context — grows on links, becomes a caret over fields,
 * a spark over the wordmark, a labelled disc on the main call to action.
 * Touch: no cursor; taps leave a short spark ripple instead.
 */
export function AuraCursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const ripples = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const html = document.documentElement;
    const cleanups: Array<() => void> = [];

    // ---- touch ripples (all devices, only for touch / pen pointers)
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !ripples.current) return;
      const r = document.createElement("span");
      r.className = "aura-ripple";
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      ripples.current.appendChild(r);
      r.addEventListener("animationend", () => r.remove(), { once: true });
      window.setTimeout(() => r.remove(), 900);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    cleanups.push(() => window.removeEventListener("pointerdown", onDown));

    // ---- fine pointer cursor
    if (hasFinePointer() && root.current) {
      const el = root.current;
      html.classList.add("has-cursor");
      gsap.set(el, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      const xTo = gsap.quickTo(el, "x", { duration: 0.16, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.16, ease: "power3" });
      const rotTo = gsap.quickTo(el.querySelector(".c-rot"), "rotation", { duration: 0.5, ease: "power3" });
      let state: CursorState = "default";
      let down = false;
      let seen = false;
      let lastX = 0;

      const apply = (next: CursorState, text = "") => {
        const s = down && next === "default" ? "down" : next;
        if (s !== state) {
          state = s;
          el.dataset.state = s;
        }
        if (label.current && label.current.textContent !== text) label.current.textContent = text;
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        if (!seen) {
          seen = true;
          gsap.set(el, { x: e.clientX, y: e.clientY });
          el.dataset.visible = "true";
        }
        xTo(e.clientX);
        yTo(e.clientY);
        rotTo(gsap.utils.clamp(-35, 35, (e.clientX - lastX) * 1.6));
        lastX = e.clientX;
        spark.setPointer(e.clientX, e.clientY, true);
      };
      const onOver = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const { state: s, label: l } = stateFor(e.target as Element);
        apply(s, l);
      };
      const onPress = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        down = true;
        el.dataset.down = "true";
      };
      const onRelease = () => {
        down = false;
        el.dataset.down = "false";
      };
      const onLeave = () => {
        el.dataset.visible = "false";
        spark.setPointer(0, 0, false);
        seen = false;
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      document.addEventListener("pointerdown", onPress, { passive: true });
      document.addEventListener("pointerup", onRelease, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        html.classList.remove("has-cursor");
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerdown", onPress);
        document.removeEventListener("pointerup", onRelease);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  });

  return (
    <>
      <div ref={root} className="aura-cursor" data-state="default" data-visible="false" aria-hidden="true">
        <i className="c-dot" />
        <i className="c-bar" />
        <span className="c-spark-pos">
          <span className="c-rot">
            <SparkShape className="c-spark" />
          </span>
        </span>
        <span ref={label} className="c-label t-mono" />
      </div>
      <div ref={ripples} className="aura-ripples" aria-hidden="true" />
    </>
  );
}
