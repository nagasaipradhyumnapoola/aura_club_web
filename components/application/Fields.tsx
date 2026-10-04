"use client";

import { useId, type ReactNode } from "react";

type Common = {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  name: string;
};

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="f-label">
      <span className="f-label-text">{label}</span>
      <span className="f-req t-mono">{required ? "Required" : "Optional"}</span>
    </label>
  );
}

function Msg({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="f-hint">
          {hint}
        </p>
      )}
      <p id={`${id}-err`} className="f-err" role={error ? "alert" : undefined} aria-live="polite">
        {error ?? ""}
      </p>
    </>
  );
}

const describe = (id: string, hint: ReactNode, error?: string) =>
  [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

export function TextField({
  label,
  required,
  hint,
  error,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  maxLength,
}: Common & {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url" | "numeric";
  placeholder?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="f" data-invalid={error ? "true" : "false"}>
      <Label id={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        data-field={name}
        className="f-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        autoCapitalize={type === "email" || type === "url" ? "none" : undefined}
        spellCheck={type === "email" || type === "url" || name === "registrationNumber" ? false : undefined}
      />
      <Msg id={id} error={error} hint={hint} />
    </div>
  );
}

export function TextAreaField({
  label,
  required,
  hint,
  error,
  name,
  value,
  onChange,
  rows = 4,
  maxLength = 3000,
  placeholder,
}: Common & {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="f" data-invalid={error ? "true" : "false"}>
      <Label id={id} label={label} required={required} />
      <textarea
        id={id}
        name={name}
        data-field={name}
        className="f-input f-area"
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
      />
      <div className="f-count t-mono" aria-hidden="true">
        {value.length} / {maxLength}
      </div>
      <Msg id={id} error={error} hint={hint} />
    </div>
  );
}

export function ChoiceField<T extends string>({
  label,
  required,
  hint,
  error,
  name,
  value,
  onChange,
  options,
}: Common & {
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <fieldset className="f f-set" data-invalid={error ? "true" : "false"} aria-describedby={describe(id, hint, error)}>
      <legend className="f-label">
        <span className="f-label-text">{label}</span>
        <span className="f-req t-mono">{required ? "Required" : "Optional"}</span>
      </legend>
      <div className="f-choices" role="radiogroup" aria-required={required}>
        {options.map((o, i) => (
          <label key={o.value} className="f-choice" data-on={value === o.value ? "true" : "false"}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              data-field={i === 0 ? name : undefined}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <Msg id={id} error={error} hint={hint} />
    </fieldset>
  );
}

export function ChipField({
  label,
  required,
  hint,
  error,
  name,
  value,
  onChange,
  options,
}: Common & {
  value: string[];
  onChange: (v: string[]) => void;
  options: readonly { value: string; label: string }[];
}) {
  const id = useId();
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset className="f f-set" data-invalid={error ? "true" : "false"} aria-describedby={describe(id, hint, error)}>
      <legend className="f-label">
        <span className="f-label-text">{label}</span>
        <span className="f-req t-mono">{required ? "Required" : "Optional"}</span>
      </legend>
      <div className="f-chips">
        {options.map((o, i) => (
          <label key={o.value} className="f-chip" data-on={value.includes(o.value) ? "true" : "false"}>
            <input
              type="checkbox"
              name={name}
              value={o.value}
              checked={value.includes(o.value)}
              onChange={() => toggle(o.value)}
              data-field={i === 0 ? name : undefined}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <Msg id={id} error={error} hint={hint} />
    </fieldset>
  );
}

export function LinkListField({
  label,
  required,
  hint,
  error,
  rowErrors,
  name,
  value,
  onChange,
  max,
  placeholder,
  addLabel = "Add another link",
}: Common & {
  value: string[];
  onChange: (v: string[]) => void;
  rowErrors: Record<number, string | undefined>;
  max: number;
  placeholder?: string;
  addLabel?: string;
}) {
  const id = useId();
  const set = (i: number, v: string) => onChange(value.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(value.length > 1 ? value.filter((_, j) => j !== i) : [""]);
  const hasAny = !!error || Object.values(rowErrors).some(Boolean);
  return (
    <fieldset className="f f-set" data-invalid={hasAny ? "true" : "false"} aria-describedby={describe(id, hint, error)}>
      <legend className="f-label">
        <span className="f-label-text">{label}</span>
        <span className="f-req t-mono">{required ? "Required" : "Optional"}</span>
      </legend>
      <ul className="f-links">
        {value.map((v, i) => {
          const rid = `${id}-${i}`;
          const re = rowErrors[i];
          return (
            <li key={i} className="f-link-row">
              <div className="f-link-main">
                <input
                  id={rid}
                  name={`${name}-${i}`}
                  data-field={i === 0 ? name : `${name}.${i}`}
                  className="f-input"
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={v}
                  placeholder={placeholder ?? "https://"}
                  aria-label={`${label} — link ${i + 1}`}
                  aria-invalid={re ? true : undefined}
                  aria-describedby={re ? `${rid}-err` : undefined}
                  onChange={(e) => set(i, e.target.value)}
                />
                <p id={`${rid}-err`} className="f-err" role={re ? "alert" : undefined}>
                  {re ?? ""}
                </p>
              </div>
              {(value.length > 1 || v) && (
                <button type="button" className="f-link-x t-mono" onClick={() => remove(i)} aria-label={`Remove link ${i + 1}`}>
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {value.length < max && (
        <button type="button" className="f-add t-mono" onClick={() => onChange([...value, ""])}>
          + {addLabel}
        </button>
      )}
      <Msg id={id} error={error} hint={hint} />
    </fieldset>
  );
}
