"use client";

import { SparkShape } from "@/components/aura/SparkShape";
import type { StepDef } from "@/lib/validation/application";
import { pad2 } from "@/lib/utils/random";

/** Step counter, title and a segmented progress line the spark rides along. */
export function ApplicationStepper({
  steps,
  current,
  onJump,
  showTitle = true,
}: {
  steps: StepDef[];
  current: number;
  onJump: (i: number) => void;
  showTitle?: boolean;
}) {
  const total = steps.length;
  const def = steps[current];
  return (
    <div className="stp">
      {showTitle && (
        <>
          <p className="stp-count t-mono" aria-live="polite">
            <span>
              {pad2(current + 1)} / {pad2(total)}
            </span>
          </p>
          <h2 id="app-title" tabIndex={-1} className="stp-title t-display">
            {def.title}
          </h2>
        </>
      )}
      <div className="stp-track">
        <ol className="stp-bar" aria-label="Application progress">
          {steps.map((s, i) => (
            <li key={s.id} data-state={i < current ? "done" : i === current ? "current" : "todo"}>
              <button
                type="button"
                disabled={i >= current}
                onClick={() => onJump(i)}
                aria-label={`${i < current ? "Go back to" : i === current ? "Current step:" : "Upcoming step:"} ${s.title}`}
                aria-current={i === current ? "step" : undefined}
              >
                <i />
              </button>
            </li>
          ))}
        </ol>
        <span className="stp-spark" style={{ left: `${((current + 0.5) / total) * 100}%` }} aria-hidden="true">
          <SparkShape key={current} className="stp-spark-svg" />
        </span>
      </div>
    </div>
  );
}
