"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyValues,
  fieldsForTeam,
  stepsFor,
  validateFields,
  type AppValues,
  type Errors,
  type FieldKey,
  type StepDef,
  type TeamKey,
} from "@/lib/validation/application";

const KEY = "aura:application:v1";

export type Draft = {
  team: TeamKey | null;
  step: number;
  values: AppValues;
  startedAt: number;
  nonce: string;
};

function newNonce() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function fresh(): Draft {
  return { team: null, step: 0, values: { ...emptyValues, workLinks: [""], portfolioLinks: [""] }, startedAt: Date.now(), nonce: newNonce() };
}

function load(): Draft {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return fresh();
    const p = JSON.parse(raw) as Partial<Draft> & { v?: number };
    if (!p || typeof p !== "object" || !p.values) return fresh();
    const base = fresh();
    return {
      team: p.team === "technical" || p.team === "creatives" || p.team === "operations" ? p.team : null,
      step: typeof p.step === "number" && p.step >= 0 ? p.step : 0,
      values: {
        ...base.values,
        ...p.values,
        workLinks: Array.isArray(p.values.workLinks) && p.values.workLinks.length ? p.values.workLinks : [""],
        portfolioLinks: Array.isArray(p.values.portfolioLinks) && p.values.portfolioLinks.length ? p.values.portfolioLinks : [""],
      },
      startedAt: typeof p.startedAt === "number" ? p.startedAt : base.startedAt,
      nonce: typeof p.nonce === "string" && p.nonce.length >= 8 ? p.nonce : base.nonce,
    };
  } catch {
    return fresh();
  }
}

function save(d: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* private mode / quota: the form still works, it just won't survive a reload */
  }
}

export function clearStoredDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function useApplicationDraft() {
  const [draft, setDraft] = useState<Draft>(() => (typeof window === "undefined" ? fresh() : load()));
  const [errors, setErrors] = useState<Errors>({});
  const timer = useRef<number | null>(null);

  // persist, lightly debounced so typing stays cheap
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(draft), 250);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [draft]);

  // also flush on tab hide so nothing typed in the last quarter second is lost
  const draftRef = useRef(draft);
  draftRef.current = draft;
  useEffect(() => {
    const flush = () => save(draftRef.current);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  const steps: StepDef[] = draft.team ? stepsFor(draft.team) : [];
  const stepDef = steps[draft.step];

  const clearErrorsFor = useCallback((key: string) => {
    setErrors((e) => {
      const next = { ...e };
      let changed = false;
      for (const k of Object.keys(next)) {
        if (k === key || k.startsWith(`${key}.`)) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : e;
    });
  }, []);

  const setField = useCallback(
    <K extends FieldKey>(key: K, value: AppValues[K]) => {
      setDraft((d) => ({ ...d, values: { ...d.values, [key]: value } }));
      clearErrorsFor(key);
    },
    [clearErrorsFor],
  );

  const setTeam = useCallback((team: TeamKey) => {
    setDraft((d) => ({ ...d, team, step: 0 }));
    setErrors({});
  }, []);

  const changeTeam = useCallback(() => {
    setDraft((d) => ({ ...d, team: null, step: 0 }));
    setErrors({});
  }, []);

  const goTo = useCallback((step: number, keepErrors = false) => {
    setDraft((d) => ({ ...d, step: Math.max(0, step) }));
    if (!keepErrors) setErrors({});
  }, []);

  /** Validate the current step; on success move forward. Returns the errors (empty when moved on). */
  const next = useCallback((): Errors => {
    const d = draftRef.current;
    if (!d.team) return {};
    const def = stepsFor(d.team)[d.step];
    const errs = validateFields(d.team, d.values, def.fields);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setDraft((x) => ({ ...x, step: x.step + 1 }));
    return errs;
  }, []);

  const back = useCallback(() => {
    setDraft((d) => ({ ...d, step: Math.max(0, d.step - 1) }));
    setErrors({});
  }, []);

  /** Validate everything, return which step first has a problem (or -1). */
  const validateAll = useCallback((): { errors: Errors; firstStep: number } => {
    const d = draftRef.current;
    if (!d.team) return { errors: {}, firstStep: -1 };
    const errs = validateFields(d.team, d.values, fieldsForTeam(d.team));
    setErrors(errs);
    const defs = stepsFor(d.team);
    const first = defs.findIndex((s) => s.fields.some((f) => Object.keys(errs).some((k) => k === f || k.startsWith(`${f}.`))));
    return { errors: errs, firstStep: first };
  }, []);

  const applyServerErrors = useCallback((fe: Errors) => {
    setErrors(fe);
    const d = draftRef.current;
    if (!d.team) return -1;
    const defs = stepsFor(d.team);
    return defs.findIndex((s) => s.fields.some((f) => Object.keys(fe).some((k) => k === f || k.startsWith(`${f}.`))));
  }, []);

  const reset = useCallback(() => {
    clearStoredDraft();
    setDraft(fresh());
    setErrors({});
  }, []);

  return {
    draft,
    errors,
    setErrors,
    steps,
    stepDef,
    setField,
    setTeam,
    changeTeam,
    goTo,
    next,
    back,
    validateAll,
    applyServerErrors,
    reset,
  };
}

export type ApplicationDraftApi = ReturnType<typeof useApplicationDraft>;
