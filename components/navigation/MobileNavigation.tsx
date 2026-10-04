"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { nav } from "@/data/site";
import { ui, useStore } from "@/lib/motion/store";
import { lockScroll, unlockScroll } from "@/lib/motion/scroll";
import { prefersReducedMotion } from "@/lib/motion/media";
import { useAura } from "@/components/aura/AuraProvider";
import { ThemeToggle } from "./ThemeToggle";

/** Full-screen menu overlay for small screens. */
export function MobileNavigation() {
  const open = useStore(ui, (s) => s.menuOpen, false);
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const { goTo } = useAura();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      lockScroll();
      el.style.visibility = "visible";
      const items = el.querySelectorAll("[data-item]");
      if (reduced) {
        gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(items, { opacity: 1, y: 0 });
      } else {
        gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.out" });
        gsap.fromTo(items, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "expo.out", delay: 0.12 });
      }
      closeBtn.current?.focus();
    } else if (el.style.visibility === "visible") {
      unlockScroll();
      if (reduced) {
        el.style.visibility = "hidden";
      } else {
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.5,
          ease: "expo.inOut",
          onComplete: () => {
            el.style.visibility = "hidden";
          },
        });
      }
      opener.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ui.set({ menuOpen: false });
      if (e.key === "Tab" && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>("a[href], button");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    // leaving the mobile layout while open would strand the user in a hidden menu
    const mq = window.matchMedia("(min-width: 1240px)");
    const onMq = () => mq.matches && ui.set({ menuOpen: false });
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <div
      ref={root}
      id="mobile-menu"
      className="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      style={{ visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" }}
      data-lenis-prevent
    >
      <div className="mobile-menu-bar">
        <span className="t-mono">Menu</span>
        <button ref={closeBtn} type="button" className="t-mono" onClick={() => ui.set({ menuOpen: false })}>
          Close ✕
        </button>
      </div>
      <ul className="mobile-menu-list">
        {nav.map((n, i) => (
          <li key={n.id} className="mobile-menu-row">
            <a
              href={`#${n.id}`}
              data-item
              onClick={(e) => {
                e.preventDefault();
                goTo(n.id);
              }}
            >
              <span className="t-mono">0{i + 1}</span>
              <span className="t-display">{n.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mobile-menu-foot">
        <ThemeToggle />
      </div>
    </div>
  );
}
