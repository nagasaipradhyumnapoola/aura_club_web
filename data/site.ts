export const site = {
  name: "AURA",
  expansion: "AI United for Real World Applications",
  institution: "SRM Institute of Science and Technology",

  // Contact links. An empty value is not linked: LinkedIn shows as a placeholder until its URL is added.
  social: {
    linkedin: "",
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

