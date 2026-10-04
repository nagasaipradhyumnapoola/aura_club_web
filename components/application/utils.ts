import type { Errors } from "@/lib/validation/application";

/** { "workLinks.2": "msg" } -> { 2: "msg" } */
export function rowErrorsFor(errors: Errors, key: string): Record<number, string | undefined> {
  const out: Record<number, string | undefined> = {};
  const prefix = `${key}.`;
  for (const k of Object.keys(errors)) {
    if (k.startsWith(prefix)) out[Number(k.slice(prefix.length))] = errors[k];
  }
  return out;
}
