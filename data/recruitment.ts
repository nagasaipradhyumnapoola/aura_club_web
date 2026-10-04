import type { TeamId } from "./structure";

export type RecruitPath = {
  id: TeamId;
  name: string;
  steps: string[];
  copy: string[];
  list?: string[];
  line?: string;
};

export const recruitPaths: RecruitPath[] = [
  {
    id: "technical",
    name: "TECHNICAL",
    steps: ["APPLY", "PROFILE REVIEW", "SHORTLIST", "ASSIGNED PROJECT", "GENERAL INTERVIEW", "AURA"],
    copy: [
      "We first look at your profile and what you have already tried to build.",
      "Shortlisted Technical applicants receive a project. The project helps us understand how you think, learn, build and finish.",
      "After the project round, selected applicants move to a general interview. Final selections enter AURA.",
    ],
    line: "SHOW US HOW YOU BUILD.",
  },
  {
    id: "creatives",
    name: "CREATIVES",
    steps: ["APPLY", "PORTFOLIO REVIEW", "INTERVIEW", "AURA"],
    copy: [
      "We want to see your work.",
      "Applicants can submit multiple work links. Shortlisted candidates move to an interview.",
    ],
    list: ["Designs.", "Videos.", "Edits.", "Motion.", "Photography.", "Content.", "Anything that represents what you can do."],
  },
  {
    id: "operations",
    name: "OPERATIONS",
    steps: ["APPLY", "PROFILE REVIEW", "INTERVIEW", "AURA"],
    copy: [
      "Operations selection focuses more on how you communicate, take responsibility, work with people and get things done.",
      "No project round is required for Operations.",
    ],
  },
];
