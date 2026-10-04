export type Principle = {
  id: string;
  no: string;
  headline: string[];
  copy: string[];
};

export const principles: Principle[] = [
  {
    id: "one-identity",
    no: "01",
    headline: ["ONE TECHNICAL", "IDENTITY.", "BUILD WITH AI."],
    copy: [
      "We are not dividing technology into a collection of disconnected teams.",
      "AURA has one technical identity: AI-native builders.",
      "The problem comes first. The tools come after.",
    ],
  },
  {
    id: "learn-the-future",
    no: "02",
    headline: ["LEARN THE FUTURE.", "CREATE PART", "OF IT."],
    copy: [
      "We do not want members only consuming tutorials, talks and new tools.",
      "Learn something. Use it. Build something. Then make it better.",
    ],
  },
  {
    id: "your-box",
    no: "03",
    headline: ["YOU DON'T HAVE", "TO STAY IN", "YOUR BOX."],
    copy: [
      "Your primary team gives you responsibility. It does not create a wall.",
      "Someone from Creatives or Operations can learn and build technically. Someone from Technical can contribute to design, media, outreach or operations.",
      "People should be able to grow beyond the label they joined with.",
    ],
  },
  {
    id: "growth",
    no: "04",
    headline: ["GROWTH DOESN'T", "STOP AT ENTRY."],
    copy: [
      "Getting into AURA is not the finish line.",
      "Members should continue taking on harder work, building faster, improving their skills and accepting greater responsibility.",
      "Progress should create opportunity. Promotions and larger responsibilities should come from consistent work and growth.",
    ],
  },
  {
    id: "teaching",
    no: "05",
    headline: ["TEACHING", "ISN'T", "ONE-WAY."],
    copy: [
      "Open learning sessions, podcasts and panel discussions give people space to teach, question, demonstrate and discuss.",
      "Useful knowledge should not remain with one person. If someone inside AURA learns something valuable, they should be able to bring it back to everyone else.",
    ],
  },
];
