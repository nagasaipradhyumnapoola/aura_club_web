export type TeamId = "technical" | "creatives" | "operations";

export type Team = {
  id: TeamId;
  name: string;
  tag?: string;
  copy: string[];
  areas?: string[];
};

export const teams: Team[] = [
  {
    id: "technical",
    name: "TECHNICAL",
    tag: "AI-NATIVE BUILDERS",
    copy: [
      "One technical team. No artificial walls between technologies.",
      "AURA's technical members are AI-native builders — people who use AI as part of how they research, think, prototype, code, test and build.",
      "The problem comes first. The tools come after. A builder should be able to move across technologies when the problem requires it.",
    ],
  },
  {
    id: "creatives",
    name: "CREATIVES",
    copy: [
      "Creatives shape how AURA is seen, remembered and communicated.",
      "They work across visual identity, design, media, storytelling and the content surrounding what AURA builds.",
    ],
    areas: [
      "visual identity",
      "graphic design",
      "video editing",
      "motion",
      "photography",
      "content",
      "social media",
      "storytelling",
      "event creatives",
    ],
  },
  {
    id: "operations",
    name: "OPERATIONS",
    copy: [
      "Operations makes sure ideas actually happen.",
      "From coordination and events to outreach, partnerships and execution, Operations connects the people and moving parts behind AURA.",
    ],
    areas: [
      "event execution",
      "coordination",
      "outreach",
      "partnerships",
      "people",
      "logistics",
      "community operations",
    ],
  },
];

export const freedom = {
  headline: ["YOUR TEAM IS", "YOUR RESPONSIBILITY."],
  counter: "NOT YOUR LIMIT.",
  copy: [
    "A member may belong primarily to Technical, Creatives or Operations. But learning does not stop there.",
    "A Creative or Operations member who wants to learn and build technically should be able to participate in technical learning. A Technical member can also contribute to design, media, operations or other work they are good at.",
    "Your primary team tells us where you take responsibility. It does not decide everything you are allowed to learn.",
  ],
};
