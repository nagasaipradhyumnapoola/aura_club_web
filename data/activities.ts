export type Activity = {
  id: string;
  no: string;
  title: string[];
  meta?: { label: string; value: string };
  copy: string[];
};

export const activities: Activity[] = [
  {
    id: "internal-hackathons",
    no: "01",
    title: ["INTERNAL", "HACKATHONS"],
    meta: { label: "Frequency", value: "ONCE EVERY MONTH" },
    copy: [
      "We run internal hackathons within AURA to make building a habit, not something we only do when a competition appears.",
      "Members work against a problem, a deadline and, when needed, a team.",
      "The goal is to build faster, make decisions, handle pressure, finish ideas and learn from what did not work.",
      "Internal hackathons also prepare our builders for larger external hackathons.",
    ],
  },
  {
    id: "external-hackathons",
    no: "02",
    title: ["EXTERNAL", "HACKATHONS"],
    copy: [
      "We want AURA teams competing outside the club as often as possible.",
      "External hackathons expose our builders to new problems, different environments, stronger competition and people they would never meet by staying inside campus.",
      "We want to build well enough that AURA becomes a name people recognize when our teams show up.",
    ],
  },
  {
    id: "continuous-projects",
    no: "03",
    title: ["CONTINUOUS", "PROJECTS"],
    meta: { label: "Target", value: "ONE MEANINGFUL PROJECT EVERY MONTH" },
    copy: [
      "Learning should end in something that works.",
      "AURA builders continuously work on practical projects, with the goal of completing at least one meaningful project every month.",
      "The project decides the structure. Some projects can be built individually. Some need a team.",
      "What matters is that the result can be demonstrated, explained and improved.",
    ],
  },
  {
    id: "podcasts-panels",
    no: "04",
    title: ["PODCASTS", "+", "PANEL DISCUSSIONS"],
    copy: [
      "Not every useful conversation needs to look like a classroom session.",
      "AURA creates space for open conversations with builders, engineers, founders, researchers, students and people who have something worth sharing.",
      "Podcasts and panel discussions can explore technology, AI, building, careers, research, ideas, mistakes and where the future may be moving.",
    ],
  },
  {
    id: "open-learning",
    no: "05",
    title: ["OPEN", "LEARNING", "SESSIONS"],
    meta: { label: "Frequency", value: "ONCE EVERY TWO WEEKS" },
    copy: [
      "AURA's open learning sessions are spaces to teach, demonstrate, question and explore together.",
      "A session can begin with an idea and end with something working.",
      "If someone inside AURA learns something useful, they should be able to bring it back to everyone else.",
      "These sessions should not feel like another classroom lecture.",
    ],
  },
];

export const hackathonLoop = ["BUILD.", "BREAK.", "LEARN.", "REPEAT."];
export const externalWords = ["GO OUT.", "BUILD.", "COMPETE."];
export const projectSteps = ["IDEA", "BUILD", "TEST", "DEMO", "IMPROVE"];
export const sessionTopics = [
  "AI tools.",
  "Models.",
  "Agents.",
  "Research.",
  "New frameworks.",
  "Things someone discovered while building.",
];
export const sessionVerbs = ["SHOW", "BUILD", "QUESTION", "TEACH", "EXPERIMENT"];
export const conversationTopics = [
  "technology",
  "AI",
  "building",
  "careers",
  "research",
  "ideas",
  "mistakes",
  "where the future may be moving",
];
