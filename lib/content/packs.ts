/**
 * Sprint 12 — Build content packs (german / english)
 */
import type { Language } from "../types";
import type { ContentPack } from "./types";
import { materializeAllMilestones } from "./resolver";
import { WORLD_MILESTONE_DEFS } from "./milestone-defs/world";
import { getLegacyMilestones } from "./legacy-milestones";
import { ENGLISH_ROADMAP, GERMAN_ROADMAP } from "./journey-content";

const GERMAN_UI = {
  journeyLabel: "在德国的日子",
  productPromise: "欢迎来到德国。",
  enterMilestoneStart: "走吧",
  enterMilestoneContinue: "继续走走",
  journeyTagline: "从今天开始，我会一直陪着你。",
  thinkingShiftLabel: "生活的感觉",
} as const;

const ENGLISH_UI = {
  journeyLabel: "Life abroad",
  productPromise: "You're here. Anna's with you.",
  enterMilestoneStart: "Let's go",
  enterMilestoneContinue: "Keep going",
  journeyTagline: "From today on, I'm right beside you.",
  thinkingShiftLabel: "Living the day",
} as const;

const GERMAN_PROMPTS = {
  sceneSystem: "Rahme die Szene für den Lernenden. Kurz. Echtes Leben, kein Unterricht.",
  coachSystem: "Ein Bedeutungshinweis nach diesem Moment. Kurz. Im Gespräch bleiben.",
  npcSystem: "Du bist ein NPC in Deutschland. Kurz. Natürlich. Kein Unterricht. Du bist nicht Anna.",
  evaluateSystem: "Bewerte nur ob der Lernende kämpft. Keine Punktzahl anzeigen.",
} as const;

const ENGLISH_PROMPTS = {
  sceneSystem: "Frame the scene for the learner. Brief. Real life, not a lesson.",
  coachSystem: "One meaning nudge after this moment. Brief. Stay in the conversation.",
  npcSystem: "You are an NPC abroad. Brief. Natural. No teaching. You are not Anna.",
  evaluateSystem: "Judge only whether the learner is struggling. Never show a score.",
} as const;

const GERMAN_ENGINE = {
  npcClarifyMisunderstood: "Wie bitte?",
  npcClarifyRepeat: "Noch einmal?",
  annaKnowsAlready: "你说过——自然地再来一次。",
  annaTryAgain: "没关系，再说一次——我就在旁边。",
} as const;

const ENGLISH_ENGINE = {
  npcClarifyMisunderstood: "Sorry?",
  npcClarifyRepeat: "Once more?",
  annaKnowsAlready: "You said this — say it again, naturally.",
  annaTryAgain: "It's fine — try again. I'm right here.",
} as const;

function buildPack(language: Language): ContentPack {
  const ui = language === "german" ? GERMAN_UI : ENGLISH_UI;
  const prompts = language === "german" ? GERMAN_PROMPTS : ENGLISH_PROMPTS;
  const engine = language === "german" ? GERMAN_ENGINE : ENGLISH_ENGINE;
  const roadmap = language === "german" ? GERMAN_ROADMAP : ENGLISH_ROADMAP;

  const fromDefs = materializeAllMilestones(WORLD_MILESTONE_DEFS, language, ui.journeyLabel);
  const legacy = getLegacyMilestones(language);

  return {
    id: language,
    journeyLabel: ui.journeyLabel,
    roadmap,
    milestones: { ...fromDefs, ...legacy },
    ui: { ...ui },
    prompts: { ...prompts },
    engine: { ...engine },
  };
}

export const CONTENT_PACK_GERMAN: ContentPack = buildPack("german");
export const CONTENT_PACK_ENGLISH: ContentPack = buildPack("english");

export const CONTENT_PACKS: Record<Language, ContentPack> = {
  german: CONTENT_PACK_GERMAN,
  english: CONTENT_PACK_ENGLISH,
};
