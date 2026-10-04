"use client";

import { useRef } from "react";
import { site, telHref } from "@/data/site";
import { AuraLogo } from "@/components/aura/AuraLogo";
import { useScene, useSparkTrack } from "@/lib/motion/hooks";

type Link = { label: string; detail: string; href: string | null; external: boolean };

function handleOf(url: string) {
  try {
    const seg = new URL(url).pathname.split("/").filter(Boolean)[0];
    return seg ? `@${seg}` : url;
  } catch {
    return url;
  }
}

/** Instagram, Email and LinkedIn, in that order. LinkedIn stays a plain placeholder until a URL is set. */
function connectLinks(): Link[] {
  const { linkedin, instagram, email } = site.social;
  const out: Link[] = [];
  if (instagram) out.push({ label: "Instagram", detail: handleOf(instagram), href: instagram, external: true });
  if (email) out.push({ label: "Email", detail: email, href: `mailto:${email}`, external: false });
  out.push(
    linkedin
      ? { label: "LinkedIn", detail: "AURA on LinkedIn", href: linkedin, external: true }
      : { label: "LinkedIn", detail: "Coming soon", href: null, external: false },
  );
  return out;
}

export function ContactSection() {
  const scene = useRef<HTMLElement>(null);
  const links = connectLinks();
  const ops = site.contacts.operationsHead;
  const year = new Date().getFullYear();

  // last section: on phones it can only scroll until its bottom meets the viewport bottom,
  // so its live range ends there (otherwise the final reveals would never finish)
  const live = { in: 0.85, out: 1 };

  useScene(
    scene,
    ({ tl, q }) => {
      tl.fromTo(q(".ct-logo"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.26, ease: "power3.inOut" }, 0.06);
      tl.fromTo(q(".ct-tag .ln-i"), { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 0.18, ease: "power4.out" }, 0.26);
      tl.fromTo(q(".ct-inst"), { opacity: 0 }, { opacity: 1, duration: 0.16 }, 0.36);
      tl.fromTo(q(".ct-block"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.18, ease: "power2.out" }, 0.5);
      tl.fromTo(q(".ct-foot"), { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.88);
    },
    live,
  );

  useSparkTrack("contact", (h) => {
    const s = scene.current;
    if (!s) return [];
    const m = !h.pinned;
    return [
      { s: h.at(s, 0, 0, live), x: m ? 0.1 : 0.12, y: 0.5, sc: m ? 0.5 : 0.55, r: -16 },
      { s: h.at(s, 0.35, 0, live), x: m ? 0.8 : 0.8, y: m ? 0.3 : 0.4, sc: m ? 0.9 : 1.3, r: -8, bend: 0.06 },
      { s: h.at(s, 0.7, 0, live), x: m ? 0.82 : 0.78, y: m ? 0.46 : 0.5, sc: m ? 0.8 : 1.15, r: -4, bend: -0.03 },
      { s: h.at(s, 1, 0, live), x: m ? 0.84 : 0.84, y: m ? 0.5 : 0.55, sc: m ? 0.7 : 1, r: -8 },
    ];
  });

  return (
    <section ref={scene} id="contact" data-section="05 / CONNECT" className="ct" aria-label="Contact">
      <div data-stage className="ct-stage">
        <div className="ct-main">
          <AuraLogo className="ct-logo" label="AURA" />
          <p className="ct-tag t-display">
            <span className="ln">
              <span className="ln-i" data-hide>
                {site.expansion}
              </span>
            </span>
          </p>
          <p className="ct-inst t-mono" data-hide>
            {site.institution}
          </p>
        </div>

        <div className="ct-cols">
          <div className="ct-block" data-hide>
            <h2 className="t-mono ct-h">Operations</h2>
            <p className="ct-name">{ops.name}</p>
            <p className="ct-role">{ops.role}</p>
            <a className="ct-link ct-phone" href={telHref(ops.phone)}>
              {ops.phone}
            </a>

            <ul className="ct-links" aria-label="Connect with AURA">
              {links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a
                      href={l.href}
                      className="ct-link ct-social"
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span className="ct-social-k t-mono">{l.label}</span>
                      <span className="ct-social-v">
                        {l.detail}
                        <span aria-hidden="true"> ↗</span>
                      </span>
                    </a>
                  ) : (
                    <span className="ct-link ct-social ct-social-off">
                      <span className="ct-social-k t-mono">{l.label}</span>
                      <span className="ct-social-v">{l.detail}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="ct-foot t-mono" data-hide>
          AURA © {year}
        </p>
      </div>
    </section>
  );
}
