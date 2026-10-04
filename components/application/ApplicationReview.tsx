"use client";

import type { ReactNode } from "react";
import {
  CREATIVE_OPTIONS,
  OPERATIONS_OPTIONS,
  stepsFor,
  type AppValues,
  type FieldKey,
  type TeamKey,
} from "@/lib/validation/application";

const LABELS: Record<FieldKey, string> = {
  fullName: "Full name",
  registrationNumber: "Registration number",
  email: "Email address",
  phone: "Phone number",
  linkedinUrl: "LinkedIn",
  inOtherClubs: "Part of other clubs",
  clubDetails: "Clubs and roles",
  experience: "Experience",
  githubUrl: "GitHub",
  workLinks: "Things you built",
  projectStory: "One thing that taught you something",
  aiUsage: "How you use AI while building",
  buildIdea: "What you'd build at AURA",
  creativeInterests: "You work with",
  creativeOther: "Other",
  portfolioLinks: "Your work",
  creativeNotes: "What you enjoy most",
  operationsInterests: "Work you'd handle",
  responsibilityStory: "Taking responsibility",
  operationsNotes: "Anything else",
};

function labelOf(options: readonly { value: string; label: string }[], v: string) {
  return options.find((o) => o.value === v)?.label ?? v.toUpperCase();
}

function render(field: FieldKey, v: AppValues): ReactNode {
  const val = v[field];
  if (Array.isArray(val)) {
    const items = val.map((x) => x.trim()).filter(Boolean);
    if (!items.length) return null;
    if (field === "creativeInterests") return items.map((x) => labelOf(CREATIVE_OPTIONS, x)).join(" · ");
    if (field === "operationsInterests") return items.map((x) => labelOf(OPERATIONS_OPTIONS, x)).join(" · ");
    return (
      <ul className="rv-links">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  }
  if (field === "inOtherClubs") return val ? String(val).toUpperCase() : null;
  const s = String(val).trim();
  return s || null;
}

export function ApplicationReview({
  team,
  values,
  onEdit,
  onSubmit,
  submitting,
  error,
}: {
  team: TeamKey;
  values: AppValues;
  onEdit: (stepIndex: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const steps = stepsFor(team);
  return (
    <div className="rv">
      <p className="t-mono rv-kicker">
        {String(steps.length).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
      </p>
      <h2 id="app-title" tabIndex={-1} className="rv-title t-display">
        REVIEW YOUR
        <br />
        APPLICATION
      </h2>
      <p className="rv-team t-mono">Applying to {team.toUpperCase()}</p>

      {steps
        .filter((s) => s.id !== "review")
        .map((s, i) => (
          <section key={s.id} className="rv-sec" aria-label={s.title}>
            <header className="rv-sec-h">
              <h3 className="t-mono">
                {String(i + 1).padStart(2, "0")} · {s.title}
              </h3>
              <button type="button" className="rv-edit t-mono" onClick={() => onEdit(i)} aria-label={`Edit ${s.title}`}>
                Edit
              </button>
            </header>
            <dl className="rv-rows">
              {s.fields
                .filter((f) => !(f === "clubDetails" && values.inOtherClubs !== "yes"))
                .filter((f) => !(f === "creativeOther" && !values.creativeInterests.includes("other")))
                .map((f) => {
                  const out = render(f, values);
                  return (
                    <div key={f} className="rv-row">
                      <dt className="t-mono">{LABELS[f]}</dt>
                      <dd data-empty={out ? "false" : "true"}>{out ?? "—"}</dd>
                    </div>
                  );
                })}
            </dl>
          </section>
        ))}

      {error && (
        <p className="rv-error" role="alert">
          {error}
        </p>
      )}

      <div className="rv-submit">
        <button type="button" className="app-primary" onClick={onSubmit} disabled={submitting} aria-busy={submitting}>
          <span>{submitting ? "SENDING…" : "SUBMIT APPLICATION"}</span>
          <span aria-hidden="true" className="app-primary-arrow">
            {submitting ? "" : "→"}
          </span>
        </button>
        <p className="rv-fine t-mono">One click is enough. Pressing twice won&apos;t send it twice.</p>
      </div>
    </div>
  );
}
