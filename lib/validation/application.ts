import { z } from "zod";

/* ------------------------------------------------------------------ vocabulary */

export const TEAM_IDS = ["technical", "creatives", "operations"] as const;
export type TeamKey = (typeof TEAM_IDS)[number];

export const CREATIVE_OPTIONS = [
  { value: "graphic-design", label: "GRAPHIC DESIGN" },
  { value: "ui-ux", label: "UI / UX" },
  { value: "video-editing", label: "VIDEO EDITING" },
  { value: "motion", label: "MOTION" },
  { value: "photography", label: "PHOTOGRAPHY" },
  { value: "content", label: "CONTENT" },
  { value: "social-media", label: "SOCIAL MEDIA" },
  { value: "other", label: "OTHER" },
] as const;

export const OPERATIONS_OPTIONS = [
  { value: "event-execution", label: "EVENT EXECUTION" },
  { value: "outreach", label: "OUTREACH" },
  { value: "partnerships", label: "PARTNERSHIPS" },
  { value: "member-coordination", label: "MEMBER COORDINATION" },
  { value: "logistics", label: "LOGISTICS" },
  { value: "general-operations", label: "GENERAL OPERATIONS" },
] as const;

export const LIMITS = {
  workLinks: 8,
  portfolioLinks: 15,
  short: 160,
  long: 3000,
} as const;

/* ------------------------------------------------------------------ values */

export type AppValues = {
  fullName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  inOtherClubs: "" | "yes" | "no";
  clubDetails: string;
  experience: string;

  githubUrl: string;
  workLinks: string[];
  projectStory: string;
  aiUsage: string;
  buildIdea: string;

  creativeInterests: string[];
  creativeOther: string;
  portfolioLinks: string[];
  creativeNotes: string;

  operationsInterests: string[];
  responsibilityStory: string;
  operationsNotes: string;
};

export type FieldKey = keyof AppValues;
export type Errors = Partial<Record<string, string>>;

export const emptyValues: AppValues = {
  fullName: "",
  registrationNumber: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  inOtherClubs: "",
  clubDetails: "",
  experience: "",
  githubUrl: "",
  workLinks: [""],
  projectStory: "",
  aiUsage: "",
  buildIdea: "",
  creativeInterests: [],
  creativeOther: "",
  portfolioLinks: [""],
  creativeNotes: "",
  operationsInterests: [],
  responsibilityStory: "",
  operationsNotes: "",
};

/* ------------------------------------------------------------------ steps */

export type StepId = "about" | "work" | "how" | "experience" | "review";
export type StepDef = { id: StepId; title: string; fields: FieldKey[] };

const ABOUT: StepDef = {
  id: "about",
  title: "ABOUT YOU",
  fields: ["fullName", "registrationNumber", "email", "phone", "linkedinUrl"],
};
const EXPERIENCE: StepDef = {
  id: "experience",
  title: "EXPERIENCE",
  fields: ["inOtherClubs", "clubDetails", "experience"],
};
const REVIEW: StepDef = { id: "review", title: "REVIEW", fields: [] };

export function stepsFor(team: TeamKey): StepDef[] {
  switch (team) {
    case "technical":
      return [
        ABOUT,
        { id: "work", title: "YOUR WORK", fields: ["githubUrl", "workLinks", "projectStory"] },
        { id: "how", title: "HOW YOU BUILD", fields: ["aiUsage", "buildIdea"] },
        EXPERIENCE,
        REVIEW,
      ];
    case "creatives":
      return [
        ABOUT,
        { id: "work", title: "YOUR WORK", fields: ["creativeInterests", "creativeOther", "portfolioLinks", "creativeNotes"] },
        EXPERIENCE,
        REVIEW,
      ];
    case "operations":
      return [
        ABOUT,
        { id: "work", title: "YOUR WORK", fields: ["operationsInterests", "responsibilityStory", "operationsNotes"] },
        EXPERIENCE,
        REVIEW,
      ];
  }
}

export function fieldsForTeam(team: TeamKey): FieldKey[] {
  return stepsFor(team).flatMap((s) => s.fields);
}

/* ------------------------------------------------------------------ urls */

/** Accepts "github.com/me" as well as full URLs; returns a normalised https URL or null. */
export function normalizeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t || t.length > 300 || /\s/.test(t)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".") || u.hostname.endsWith(".")) return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function hostIs(url: string, domain: string) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h === domain || h.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ field schemas */

const text = (label: string, min: number, max: number = LIMITS.long) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .min(min, `Tell us a little more — at least ${min} characters.`)
    .max(max, `Keep this under ${max} characters.`);

const optionalText = (max: number = LIMITS.long) => z.string().trim().max(max, `Keep this under ${max} characters.`);

const SCHEMAS = {
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your full name.")
    .min(2, "Enter your full name.")
    .max(120, "That name is too long."),
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Enter your registration number.")
    .regex(/^[A-Za-z0-9]{8,20}$/, "Use 8–20 letters and numbers, with no spaces."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "That email is too long.")
    .pipe(z.email("Enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number.")
    .refine((v) => /^\+?[0-9]{10,14}$/.test(v.replace(/[\s\-().]/g, "")), "Enter a valid phone number, 10–14 digits."),
  inOtherClubs: z.enum(["yes", "no"], { error: "Choose yes or no." }),
  experience: optionalText(),
  projectStory: text("This answer", 30),
  aiUsage: text("This answer", 30),
  buildIdea: text("This answer", 30),
  creativeInterests: z
    .array(z.enum(CREATIVE_OPTIONS.map((o) => o.value) as [string, ...string[]]))
    .min(1, "Pick at least one.")
    .max(CREATIVE_OPTIONS.length),
  creativeOther: z.string().trim().max(LIMITS.short, `Keep this under ${LIMITS.short} characters.`),
  creativeNotes: optionalText(),
  operationsInterests: z
    .array(z.enum(OPERATIONS_OPTIONS.map((o) => o.value) as [string, ...string[]]))
    .min(1, "Pick at least one.")
    .max(OPERATIONS_OPTIONS.length),
  responsibilityStory: text("This answer", 30),
  operationsNotes: optionalText(),
} as const;

type SchemaKey = keyof typeof SCHEMAS;

function validateLinks(
  rows: string[],
  key: FieldKey,
  opts: { min: number; max: number; what: string },
  errors: Errors,
) {
  const filled = rows.map((r, i) => ({ r: r.trim(), i })).filter((x) => x.r.length > 0);
  if (filled.length < opts.min) {
    errors[key] = opts.min === 1 ? `Add at least one link to ${opts.what}.` : `Add at least ${opts.min} links.`;
    return;
  }
  if (filled.length > opts.max) {
    errors[key] = `You can add up to ${opts.max} links.`;
    return;
  }
  for (const { r, i } of filled) {
    if (!normalizeUrl(r)) errors[`${key}.${i}`] = "Enter a valid link, like https://example.com/your-work";
  }
}

/**
 * Validate the given fields (or every field of the team) and return an error map.
 * Shared by the browser (per step) and the server (everything, before anything is stored).
 */
export function validateFields(team: TeamKey, v: AppValues, only?: FieldKey[]): Errors {
  const errors: Errors = {};
  const fields = only ?? fieldsForTeam(team);
  const wants = (k: FieldKey) => fields.includes(k);

  for (const k of fields) {
    if (k in SCHEMAS) {
      const res = SCHEMAS[k as SchemaKey].safeParse(v[k]);
      if (!res.success) errors[k] = res.error.issues[0]?.message ?? "Check this answer.";
    }
  }

  if (wants("linkedinUrl") && v.linkedinUrl.trim()) {
    const n = normalizeUrl(v.linkedinUrl);
    if (!n || !hostIs(n, "linkedin.com")) errors.linkedinUrl = "Use a LinkedIn link, like linkedin.com/in/your-name";
  }
  if (wants("githubUrl")) {
    const n = normalizeUrl(v.githubUrl);
    if (!v.githubUrl.trim()) errors.githubUrl = "Enter your GitHub profile.";
    else if (!n || !hostIs(n, "github.com") || new URL(n).pathname.replace(/\//g, "") === "")
      errors.githubUrl = "Use your profile link, like github.com/your-username";
  }
  if (wants("clubDetails") && v.inOtherClubs === "yes" && v.clubDetails.trim().length < 2) {
    errors.clubDetails = "List the clubs and your role in each.";
  }
  if (wants("clubDetails") && v.clubDetails.trim().length > LIMITS.long) {
    errors.clubDetails = `Keep this under ${LIMITS.long} characters.`;
  }
  if (wants("workLinks"))
    validateLinks(v.workLinks, "workLinks", { min: 1, max: LIMITS.workLinks, what: "something you built" }, errors);
  if (wants("portfolioLinks"))
    validateLinks(v.portfolioLinks, "portfolioLinks", { min: 1, max: LIMITS.portfolioLinks, what: "your work" }, errors);

  return errors;
}

/* ------------------------------------------------------------------ server payload */

export const submissionSchema = z.object({
  team: z.enum(TEAM_IDS),
  fields: z.object({
    fullName: z.string().max(400),
    registrationNumber: z.string().max(100),
    email: z.string().max(400),
    phone: z.string().max(100),
    linkedinUrl: z.string().max(600),
    inOtherClubs: z.enum(["", "yes", "no"]),
    clubDetails: z.string().max(LIMITS.long * 2),
    experience: z.string().max(LIMITS.long * 2),
    githubUrl: z.string().max(600),
    workLinks: z.array(z.string().max(600)).max(40),
    projectStory: z.string().max(LIMITS.long * 2),
    aiUsage: z.string().max(LIMITS.long * 2),
    buildIdea: z.string().max(LIMITS.long * 2),
    creativeInterests: z.array(z.string().max(60)).max(20),
    creativeOther: z.string().max(600),
    portfolioLinks: z.array(z.string().max(600)).max(40),
    creativeNotes: z.string().max(LIMITS.long * 2),
    operationsInterests: z.array(z.string().max(60)).max(20),
    responsibilityStory: z.string().max(LIMITS.long * 2),
    operationsNotes: z.string().max(LIMITS.long * 2),
  }),
  meta: z.object({
    website: z.string().max(200).optional().default(""),
    startedAt: z.number().int().optional(),
    nonce: z.string().min(8).max(80),
    turnstileToken: z.string().max(4096).optional(),
  }),
});

export type Submission = z.infer<typeof submissionSchema>;

const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);

/** Database row (aura_applications) for a validated submission. Only the chosen team's columns are filled. */
export function toRow(team: TeamKey, v: AppValues, nonce: string) {
  const url = (s: string) => (s.trim() ? normalizeUrl(s) : null);
  const row: Record<string, unknown> = {
    team,
    full_name: v.fullName.trim(),
    registration_number: v.registrationNumber.trim().toUpperCase(),
    email: v.email.trim().toLowerCase(),
    phone: v.phone.replace(/[\s\-().]/g, ""),
    linkedin_url: url(v.linkedinUrl),
    existing_clubs: v.inOtherClubs === "yes",
    existing_club_details: v.inOtherClubs === "yes" ? v.clubDetails.trim() : null,
    experience: v.experience.trim() || null,
    status: "submitted",
    submission_nonce: nonce,
  };
  if (team === "technical") {
    row.github_url = url(v.githubUrl);
    row.technical_work_links = clean(v.workLinks).map((l) => normalizeUrl(l));
    row.technical_project_story = v.projectStory.trim();
    row.technical_ai_usage = v.aiUsage.trim();
    row.technical_build_idea = v.buildIdea.trim();
  }
  if (team === "creatives") {
    const interests = [...v.creativeInterests];
    const other = v.creativeOther.trim();
    if (other && interests.includes("other")) interests[interests.indexOf("other")] = `other: ${other}`;
    row.creative_interests = interests;
    row.creative_portfolio_links = clean(v.portfolioLinks).map((l) => normalizeUrl(l));
    row.creative_notes = v.creativeNotes.trim() || null;
  }
  if (team === "operations") {
    row.operations_interests = v.operationsInterests;
    row.operations_responsibility_story = v.responsibilityStory.trim();
    row.operations_notes = v.operationsNotes.trim() || null;
  }
  return row;
}
