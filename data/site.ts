export const site = {
  name: "AURA",
  expansion: "AI United for Real World Applications",
  institution: "SRM Institute of Science and Technology",

  // Contact links. An empty value is not linked: it shows as an unlinked "Coming soon" row.
  social: {
    linkedin: "https://www.linkedin.com/company/aura-srmist/",
    instagram: "https://instagram.com/aura.srmist/",
    email: "aura.srmist@gmail.com",
  },

} as const;

export type Site = typeof site;

export const nav = [
  { id: "what-we-do", label: "What We Do" },
  { id: "structure", label: "Structure" },
  { id: "why-aura", label: "Why AURA" },
  { id: "recruitment", label: "Recruitment" },
] as const;

