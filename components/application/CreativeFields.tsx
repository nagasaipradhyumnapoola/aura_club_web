"use client";

import type { ApplicationDraftApi } from "./useApplicationDraft";
import { ChipField, LinkListField, TextAreaField, TextField } from "./Fields";
import { CREATIVE_OPTIONS, LIMITS } from "@/lib/validation/application";
import { rowErrorsFor } from "./utils";

export function CreativeFields({ api }: { api: ApplicationDraftApi }) {
  const { draft, errors, setField } = api;
  const v = draft.values;
  return (
    <div className="f-stack">
      <ChipField
        label="WHAT DO YOU WORK WITH?"
        name="creativeInterests"
        required
        value={v.creativeInterests}
        onChange={(x) => setField("creativeInterests", x)}
        error={errors.creativeInterests}
        options={CREATIVE_OPTIONS}
        hint="Pick everything that applies."
      />
      {v.creativeInterests.includes("other") && (
        <TextField
          label="WHAT ELSE?"
          name="creativeOther"
          value={v.creativeOther}
          onChange={(x) => setField("creativeOther", x)}
          error={errors.creativeOther}
          maxLength={LIMITS.short}
        />
      )}
      <LinkListField
        label="SHOW US YOUR WORK."
        name="portfolioLinks"
        required
        value={v.portfolioLinks}
        onChange={(x) => setField("portfolioLinks", x)}
        error={errors.portfolioLinks}
        rowErrors={rowErrorsFor(errors, "portfolioLinks")}
        max={LIMITS.portfolioLinks}
        addLabel="Add another piece"
        hint="Share however many pieces you feel best represent your work. Designs, edits, videos, motion work, photography, social content or anything else are welcome. Google Drive, Behance, Dribbble, YouTube, Instagram or a personal portfolio all work."
        placeholder="https://behance.net/you"
      />
      <TextAreaField
        label="WHAT PART OF CREATIVE WORK DO YOU ENJOY MOST?"
        name="creativeNotes"
        rows={4}
        value={v.creativeNotes}
        onChange={(x) => setField("creativeNotes", x)}
        error={errors.creativeNotes}
      />
    </div>
  );
}
