"use client";

import type { ApplicationDraftApi } from "./useApplicationDraft";
import { ChoiceField, TextAreaField, TextField } from "./Fields";
import { LIMITS } from "@/lib/validation/application";

export function CommonFields({ api, part }: { api: ApplicationDraftApi; part: "about" | "experience" }) {
  const { draft, errors, setField } = api;
  const v = draft.values;

  if (part === "about") {
    return (
      <div className="f-grid">
        <TextField
          label="FULL NAME"
          name="fullName"
          required
          value={v.fullName}
          onChange={(x) => setField("fullName", x)}
          error={errors.fullName}
          autoComplete="name"
          maxLength={120}
        />
        <TextField
          label="REGISTRATION NUMBER"
          name="registrationNumber"
          required
          value={v.registrationNumber}
          onChange={(x) => setField("registrationNumber", x.replace(/\s/g, "").toUpperCase())}
          error={errors.registrationNumber}
          autoComplete="off"
          maxLength={20}
        />
        <TextField
          label="EMAIL ADDRESS"
          name="email"
          type="email"
          required
          value={v.email}
          onChange={(x) => setField("email", x)}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          maxLength={254}
        />
        <TextField
          label="PHONE NUMBER"
          name="phone"
          type="tel"
          required
          value={v.phone}
          onChange={(x) => setField("phone", x)}
          error={errors.phone}
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          hint="We use this to reach shortlisted applicants."
        />
        <div className="f-wide">
          <TextField
            label="LINKEDIN PROFILE"
            name="linkedinUrl"
            type="url"
            value={v.linkedinUrl}
            onChange={(x) => setField("linkedinUrl", x)}
            error={errors.linkedinUrl}
            autoComplete="url"
            inputMode="url"
            placeholder="linkedin.com/in/your-name"
            maxLength={300}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="f-stack">
      <ChoiceField
        label="ARE YOU CURRENTLY PART OF ANY OTHER CLUBS OR STUDENT ORGANIZATIONS?"
        name="inOtherClubs"
        required
        value={v.inOtherClubs}
        onChange={(x) => setField("inOtherClubs", x)}
        error={errors.inOtherClubs}
        options={[
          { value: "yes", label: "YES" },
          { value: "no", label: "NO" },
        ]}
      />
      {v.inOtherClubs === "yes" && (
        <TextAreaField
          label="LIST THE CLUBS AND YOUR ROLE IN EACH."
          name="clubDetails"
          required
          rows={3}
          value={v.clubDetails}
          onChange={(x) => setField("clubDetails", x)}
          error={errors.clubDetails}
          maxLength={LIMITS.long}
        />
      )}
      <TextAreaField
        label="IS THERE ANY EXPERIENCE YOU'D LIKE US TO KNOW ABOUT?"
        name="experience"
        rows={5}
        value={v.experience}
        onChange={(x) => setField("experience", x)}
        error={errors.experience}
        maxLength={LIMITS.long}
        hint="Hackathons, projects, competitions, internships, communities, volunteering, events, things you have built, things you have organized, or anything else you think represents you."
      />
    </div>
  );
}
