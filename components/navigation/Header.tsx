"use client";

import { nav } from "@/data/site";
import { ui, useStore } from "@/lib/motion/store";
import { scrollToY } from "@/lib/motion/scroll";
import { useAura } from "@/components/aura/AuraProvider";
import { SparkShape } from "@/components/aura/SparkShape";
import { DockLogo } from "./DockLogo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Top bar, left to right: the floating AURA spark, the AURA name (docked in the
 * middle by DockLogo), then the menu and the colour (theme) switch — on a translucent glass bar.
 */
export function Header() {
  const visible = useStore(ui, (s) => s.headerVisible, false);
  const menuOpen = useStore(ui, (s) => s.menuOpen, false);
  const appOpen = useStore(ui, (s) => s.applicationOpen, false);
  const { goTo } = useAura();

  return (
    <>
    <header className="aura-header" data-visible={visible && !appOpen ? "true" : "false"}>
      <a
        href="#top"
        className="aura-header-mark"
        aria-label="AURA — back to the top"
        onClick={(e) => {
          e.preventDefault();
          scrollToY(0);
        }}
      >
        <SparkShape className="aura-header-mark-svg" />
      </a>

      <span className="aura-header-gap" aria-hidden="true" />

      <div className="aura-header-right">
        <nav aria-label="Primary" className="aura-header-nav t-mono">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => {
                e.preventDefault();
                goTo(n.id);
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <button
          type="button"
          className="aura-menu-trigger t-mono"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => ui.set({ menuOpen: true })}
        >
          Menu
        </button>
      </div>
    </header>
    <DockLogo />
    </>
  );
}
