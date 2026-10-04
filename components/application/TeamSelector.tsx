"use client";

import type { TeamKey } from "@/lib/validation/application";

const OPTIONS: { id: TeamKey; name: string; desc: string }[] = [
  { id: "technical", name: "TECHNICAL", desc: "AI-native builders." },
  { id: "creatives", name: "CREATIVES", desc: "Design, media and visual communication." },
  { id: "operations", name: "OPERATIONS", desc: "Execution, people and coordination." },
];

export function TeamSelector({
  current,
  onPick,
  hasDraft,
}: {
  current: TeamKey | null;
  onPick: (t: TeamKey) => void;
  hasDraft: boolean;
}) {
  return (
    <div className="ts">
      <p className="t-mono ts-kicker">00 / CHOOSE A TEAM</p>
      <h2 id="app-title" tabIndex={-1} className="ts-title t-display">
        <span>WHERE DO YOU</span>
        <span>WANT TO BUILD?</span>
      </h2>
      {hasDraft && (
        <p className="ts-note t-mono">Your earlier answers are still here. Pick a team to carry on.</p>
      )}
      <ul className="ts-list">
        {OPTIONS.map((o, i) => (
          <li key={o.id}>
            <button
              type="button"
              className="ts-opt"
              data-current={current === o.id ? "true" : "false"}
              onClick={() => onPick(o.id)}
            >
              <span className="ts-no t-mono">0{i + 1}</span>
              <span className="ts-name t-display">{o.name}</span>
              <span className="ts-desc">{o.desc}</span>
              <span className="ts-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
