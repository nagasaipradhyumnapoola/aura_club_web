"use client";

import type { ApplicationDraftApi } from "./useApplicationDraft";
import { ChipField, TextAreaField } from "./Fields";
import { OPERATIONS_OPTIONS } from "@/lib/validation/application";

export function OperationsFields({ api }: { api: ApplicationDraftApi }) {
  const { draft, errors, setField } = api;
  const v = draft.values;
  return (
    <div className="f-stack">
      <ChipField
        label="WHAT TYPE OF WORK WOULD YOU LIKE TO HANDLE?"
        name="operationsInterests"
        required
        value={v.operationsInterests}
        onChange={(x) => setField("operationsInterests", x)}
        error={errors.operationsInterests}
        options={OPERATIONS_OPTIONS}
        hint="Pick everything that applies."
      />
      <TextAreaField
        label="TELL US ABOUT A TIME YOU TOOK RESPONSIBILITY FOR GETTING SOMETHING DONE."
        name="responsibilityStory"
        required
        rows={6}
        value={v.responsibilityStory}
        onChange={(x) => setField("responsibilityStory", x)}
        error={errors.responsibilityStory}
      />
      <TextAreaField
        label="ANYTHING ELSE YOU WANT US TO KNOW?"
        name="operationsNotes"
        rows={3}
        value={v.operationsNotes}
        onChange={(x) => setField("operationsNotes", x)}
        error={errors.operationsNotes}
      />
    </div>
  );
}
