"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SPARK } from "@/lib/utils/paths";
import { SparkShape } from "@/components/aura/SparkShape";
import { applicationLaunch, useAura } from "@/components/aura/AuraProvider";
import { lockScroll, unlockScroll } from "@/lib/motion/scroll";
import { prefersReducedMotion } from "@/lib/motion/media";
import { spark } from "@/lib/motion/spark";
import { ui, useStore } from "@/lib/motion/store";
import {
  emptyValues,
  fieldsForTeam,
  type AppValues,
  type Errors,
  type TeamKey,
} from "@/lib/validation/application";
import { ApplicationReview } from "./ApplicationReview";
import { ApplicationStepper } from "./ApplicationStepper";
import { ApplicationSuccess } from "./ApplicationSuccess";
import { CommonFields } from "./CommonFields";
import { CreativeFields } from "./CreativeFields";
import { OperationsFields } from "./OperationsFields";
import { TeamSelector } from "./TeamSelector";
import { TechnicalFields } from "./TechnicalFields";
import { useApplicationDraft } from "./useApplicationDraft";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** only the chosen team's answers leave the browser */
function pickFields(team: TeamKey, v: AppValues): AppValues {
  const out: Record<string, unknown> = { ...emptyValues, workLinks: [], portfolioLinks: [] };
  for (const f of fieldsForTeam(team)) out[f] = v[f];
  return out as AppValues;
}

export function ApplicationOverlay() {
  const open = useStore(ui, (s) => s.applicationOpen, false);
  const { closeApplication } = useAura();
  const api = useApplicationDraft();
  const { draft, errors, steps, stepDef } = api;

  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const clipA = useRef<SVGPathElement>(null);
  const clipB = useRef<SVGPathElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const wasOpen = useRef(false);
  const lastStep = useRef({ view: "", step: 0 });
  const focusErrors = useRef(false);
  const submittingRef = useRef(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [doneTeam, setDoneTeam] = useState<TeamKey | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [announce, setAnnounce] = useState("");

  const view: "team" | "step" | "review" | "success" = doneTeam
    ? "success"
    : !draft.team
      ? "team"
      : stepDef?.id === "review"
        ? "review"
        : "step";

  /* ------------------------------------------------------------ spark-shaped reveal */
  const setPaths = useCallback((origin: { x: number; y: number }, k: number, rot: number) => {
    const [cx, cy] = SPARK.core;
    [clipA.current, clipB.current].forEach((p) => {
      if (!p) return;
      gsap.set(p, { svgOrigin: `${cx} ${cy}`, x: origin.x - cx, y: origin.y - cy, scale: k, rotation: rot });
    });
  }, []);

  const reveal = useCallback(() => {
    const el = root.current;
    const lay = layer.current;
    const wp = wipe.current;
    if (!el || !lay || !wp) return;
    ready.current = false;
    el.style.visibility = "visible";
    el.setAttribute("aria-hidden", "false");
    lockScroll();
    document.getElementById("main")?.setAttribute("inert", "");

    const finish = () => {
      lay.style.clipPath = "none";
      lay.style.pointerEvents = "auto";
      wp.style.display = "none";
      ready.current = true;
      (document.getElementById("app-title") ?? lay).focus({ preventScroll: true });
    };

    if (prefersReducedMotion()) {
      lay.style.clipPath = "none";
      wp.style.display = "none";
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out", onComplete: finish });
      return;
    }

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const origin = applicationLaunch.origin ?? { x: vw / 2, y: vh * 0.6 };
    const snap = spark.snapshot();
    const k0 = Math.max(120, snap.width * 0.9) / SPARK.w;
    const k1 = Math.hypot(vw, vh) / 0.085 / SPARK.w;
    gsap.set(el, { opacity: 1 });
    setPaths(origin, k0, -18);
    lay.style.pointerEvents = "none";
    lay.style.clipPath = "url(#app-clip-b)";
    wp.style.display = "block";
    wp.style.clipPath = "url(#app-clip-a)";

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(clipA.current, { scale: k1, rotation: 0, duration: 1.0, ease: "power3.in" }, 0);
    tl.to(clipB.current, { scale: k1, rotation: 0, duration: 1.0, ease: "power3.in" }, 0.14);
  }, [setPaths]);

  const hide = useCallback(() => {
    const el = root.current;
    const lay = layer.current;
    const wp = wipe.current;
    if (!el || !lay || !wp) return;
    ready.current = false;

    const done = () => {
      el.style.visibility = "hidden";
      el.setAttribute("aria-hidden", "true");
      lay.style.clipPath = "none";
      wp.style.display = "none";
      document.getElementById("main")?.removeAttribute("inert");
      unlockScroll();
      spark.manual = null;
      const t = applicationLaunch.trigger;
      if (t && document.contains(t)) t.focus({ preventScroll: true });
    };

    if (prefersReducedMotion()) {
      gsap.to(el, { opacity: 0, duration: 0.3, ease: "power1.in", onComplete: done });
      return;
    }

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const t = applicationLaunch.trigger;
    const r = t && document.contains(t) ? t.getBoundingClientRect() : null;
    const origin = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: vw / 2, y: vh * 0.6 };
    const k1 = Math.hypot(vw, vh) / 0.085 / SPARK.w;
    const k0 = 140 / SPARK.w;
    setPaths(origin, k1, 0);
    lay.style.pointerEvents = "none";
    lay.style.clipPath = "url(#app-clip-b)";
    wp.style.display = "block";
    wp.style.clipPath = "url(#app-clip-a)";
    const tl = gsap.timeline({ onComplete: done });
    tl.to(clipB.current, { scale: k0, rotation: -18, duration: 0.85, ease: "power3.inOut" }, 0);
    tl.to(clipA.current, { scale: k0 * 0.8, rotation: -18, duration: 0.85, ease: "power3.inOut" }, 0.1);
  }, [setPaths]);

  useEffect(() => {
    if (open && !wasOpen.current) {
      wasOpen.current = true;
      reveal();
    } else if (!open && wasOpen.current) {
      wasOpen.current = false;
      hide();
    }
  }, [open, reveal, hide]);

  // keyboard: Esc closes (the draft is kept), Tab stays inside the dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ready.current) {
        e.preventDefault();
        closeApplication();
        return;
      }
      if (e.key !== "Tab" || !layer.current) return;
      const f = Array.from(layer.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === layer.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeApplication]);

  /* ------------------------------------------------------------ step transitions + focus */
  useEffect(() => {
    const key = { view, step: draft.step };
    const prev = lastStep.current;
    lastStep.current = key;
    const el = body.current;
    if (!el || !open) return;
    if (prev.view === key.view && prev.step === key.step) return;
    const dir = key.view === "step" && prev.view === "step" && key.step < prev.step ? -1 : 1;
    scroller.current?.scrollTo({ top: 0 });
    if (!prefersReducedMotion()) {
      gsap.fromTo(el, { opacity: 0, x: 36 * dir }, { opacity: 1, x: 0, duration: 0.55, ease: "expo.out", clearProps: "transform" });
    }
    if (ready.current && !focusErrors.current) {
      (document.getElementById("app-title") as HTMLElement | null)?.focus({ preventScroll: true });
    }
  }, [view, draft.step, open]);

  // after a failed Next / submit, put focus on the first field that needs attention
  useEffect(() => {
    if (!focusErrors.current || !Object.keys(errors).length) return;
    focusErrors.current = false;
    const first = body.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (first) {
      first.focus({ preventScroll: true });
      first.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
    const n = Object.keys(errors).length;
    setAnnounce(`${n} ${n === 1 ? "answer needs" : "answers need"} fixing.`);
  }, [errors, view]);

  /* ------------------------------------------------------------ actions */
  const onNext = () => {
    const errs = api.next();
    if (Object.keys(errs).length) focusErrors.current = true;
  };

  const goReview = (i: number) => api.goTo(i);

  const onSubmit = async () => {
    if (submittingRef.current || !draft.team) return;
    const { errors: errs, firstStep } = api.validateAll();
    if (firstStep >= 0) {
      focusErrors.current = true;
      setSubmitError("A few answers need fixing before this can be sent. We've taken you to the first one.");
      api.goTo(firstStep, true);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    const team = draft.team;
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team,
          fields: pickFields(team, draft.values),
          meta: { website: honeypot, startedAt: draft.startedAt, nonce: draft.nonce },
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; code?: string; message?: string; fieldErrors?: Errors }
        | null;
      if (res.ok && data && data.ok) {
        // only now, with the server's word, is the draft cleared
        setDoneTeam(team);
        api.reset();
        setSubmitError(null);
        return;
      }
      const fail = data && !data.ok ? data : null;
      if (fail?.fieldErrors && Object.keys(fail.fieldErrors).length) {
        const step = api.applyServerErrors(fail.fieldErrors);
        focusErrors.current = true;
        setSubmitError(fail.message ?? "Some answers need fixing.");
        if (step >= 0) api.goTo(step, true);
      } else {
        setSubmitError(fail?.message ?? "Something went wrong on our side. Your answers are saved here — please try again.");
      }
    } catch {
      setSubmitError("We couldn't reach the server. Check your connection — your answers are saved here, so you can try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const onDone = () => {
    closeApplication();
    // reset local view state once the layer has left
    window.setTimeout(() => setDoneTeam(null), 1100);
  };

  /* ------------------------------------------------------------ render */
  const showFooter = view === "step";
  const stepIndex = draft.step;

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="app-clip-a" clipPathUnits="userSpaceOnUse">
            <path ref={clipA} d={SPARK.d} />
          </clipPath>
          <clipPath id="app-clip-b" clipPathUnits="userSpaceOnUse">
            <path ref={clipB} d={SPARK.d} />
          </clipPath>
        </defs>
      </svg>

      <div ref={root} className="app" style={{ visibility: "hidden" }} aria-hidden="true">
        <div ref={wipe} className="app-wipe" style={{ display: "none" }} />
        <div
          ref={layer}
          className="app-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-title"
          tabIndex={-1}
        >
          <header className="app-bar">
            <SparkShape className="app-bar-logo" />
            <div className="app-bar-mid t-mono">
              {draft.team && view !== "success" ? (
                <>
                  <span>{draft.team.toUpperCase()}</span>
                  <button type="button" className="app-link" onClick={api.changeTeam}>
                    Change team
                  </button>
                </>
              ) : (
                <span>Application</span>
              )}
            </div>
            <button type="button" className="app-close t-mono" onClick={closeApplication} aria-label="Close application">
              Close <span aria-hidden="true">✕</span>
            </button>
          </header>

          <div ref={scroller} className="app-scroll" data-lenis-prevent>
            <div className="app-inner">
              {(view === "step" || view === "review") && draft.team && (
                <ApplicationStepper steps={steps} current={stepIndex} onJump={(i) => api.goTo(i)} showTitle={view === "step"} />
              )}

              <div ref={body} className="app-body" data-view={view}>
                {view === "team" && (
                  <TeamSelector
                    current={draft.team}
                    hasDraft={Object.values(draft.values).some((x) => (Array.isArray(x) ? x.some(Boolean) : Boolean(x)))}
                    onPick={api.setTeam}
                  />
                )}

                {view === "step" && draft.team && (
                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      onNext();
                    }}
                    aria-labelledby="app-title"
                  >
                    {stepDef.id === "about" && <CommonFields api={api} part="about" />}
                    {stepDef.id === "experience" && <CommonFields api={api} part="experience" />}
                    {stepDef.id === "work" && draft.team === "technical" && <TechnicalFields api={api} part="work" />}
                    {stepDef.id === "how" && draft.team === "technical" && <TechnicalFields api={api} part="how" />}
                    {stepDef.id === "work" && draft.team === "creatives" && <CreativeFields api={api} />}
                    {stepDef.id === "work" && draft.team === "operations" && <OperationsFields api={api} />}

                    <div className="app-hp" aria-hidden="true">
                      <label>
                        Leave this field empty
                        <input
                          type="text"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </label>
                    </div>
                    <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
                  </form>
                )}

                {view === "review" && draft.team && (
                  <ApplicationReview
                    team={draft.team}
                    values={draft.values}
                    onEdit={goReview}
                    onSubmit={onSubmit}
                    submitting={submitting}
                    error={submitError}
                  />
                )}

                {view === "success" && doneTeam && <ApplicationSuccess team={doneTeam} onDone={onDone} />}
              </div>
            </div>
          </div>

          {showFooter && (
            <footer className="app-foot">
              <button type="button" className="app-back t-mono" onClick={() => (stepIndex === 0 ? api.changeTeam() : api.back())}>
                <span aria-hidden="true">←</span> Back
              </button>
              <button type="button" className="app-primary" onClick={onNext}>
                <span>NEXT</span>
                <span aria-hidden="true" className="app-primary-arrow">
                  →
                </span>
              </button>
            </footer>
          )}

          {view === "review" && (
            <footer className="app-foot app-foot-review">
              <button type="button" className="app-back t-mono" onClick={() => api.back()}>
                <span aria-hidden="true">←</span> Back
              </button>
            </footer>
          )}

          <p className="sr-only" role="status" aria-live="polite">
            {announce}
          </p>
        </div>
      </div>
    </>
  );
}
