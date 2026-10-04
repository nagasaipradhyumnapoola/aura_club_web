"use client";

import type { ApplicationDraftApi } from "./useApplicationDraft";
import { LinkListField, TextAreaField, TextField } from "./Fields";
import { LIMITS } from "@/lib/validation/application";
import { rowErrorsFor } from "./utils";

export function TechnicalFields({ api, part }: { api: ApplicationDraftApi; part: "work" | "how" }) {
  const { draft, errors, setField } = api;
  const v = draft.values;

  if (part === "work") {
    return (
      <div className="f-stack">
        <TextField
          label="GITHUB PROFILE"
          name="githubUrl"
          type="url"
          required
          value={v.githubUrl}
          onChange={(x) => setField("githubUrl", x)}
          error={errors.githubUrl}
          inputMode="url"
          placeholder="github.com/your-username"
          maxLength={300}
        />
        <LinkListField
          label="SHOW US SOMETHING YOU HAVE BUILT."
          name="workLinks"
          required
          value={v.workLinks}
          onChange={(x) => setField("workLinks", x)}
          error={errors.workLinks}
          rowErrors={rowErrorsFor(errors, "workLinks")}
          max={LIMITS.workLinks}
          hint="Add as many as you like: a GitHub repository, a live demo, a project, research, a prototype, or any other URL."
          placeholder="https://github.com/you/project"
        />
        <TextAreaField
          label="TELL US ABOUT ONE THING YOU BUILT THAT TAUGHT YOU SOMETHING."
          name="projectStory"
          required
          rows={6}
          value={v.projectStory}
          onChange={(x) => setField("projectStory", x)}
          error={errors.projectStory}
        />
      </div>
    );
  }

  return (
    <div className="f-stack">
      <TextAreaField
        label="HOW DO YOU CURRENTLY USE AI WHILE BUILDING?"
        name="aiUsage"
        required
        rows={6}
        value={v.aiUsage}
        onChange={(x) => setField("aiUsage", x)}
        error={errors.aiUsage}
      />
      <TextAreaField
        label="IF YOU JOIN AURA, WHAT WOULD YOU LIKE TO BUILD?"
        name="buildIdea"
        required
        rows={6}
        value={v.buildIdea}
        onChange={(x) => setField("buildIdea", x)}
        error={errors.buildIdea}
      />
    </div>
  );
}
