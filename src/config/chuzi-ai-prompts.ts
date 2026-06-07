/**
 * Guided prompts for Chuzi AI story creation.
 */

export interface ChuziAiPromptStep {
  key: string;
  lexicon_title: string;
  lexicon_hint: string;
  required?: boolean;
}

export const CHUZI_AI_PROMPT_STEPS: ChuziAiPromptStep[] = [
  {
    key: "protagonist",
    lexicon_title: "chuzi_ai_step_protagonist",
    lexicon_hint: "chuzi_ai_step_protagonist_hint",
    required: true,
  },
  {
    key: "setting",
    lexicon_title: "chuzi_ai_step_setting",
    lexicon_hint: "chuzi_ai_step_setting_hint",
    required: true,
  },
  {
    key: "conflict",
    lexicon_title: "chuzi_ai_step_conflict",
    lexicon_hint: "chuzi_ai_step_conflict_hint",
    required: true,
  },
  {
    key: "journey",
    lexicon_title: "chuzi_ai_step_journey",
    lexicon_hint: "chuzi_ai_step_journey_hint",
    required: true,
  },
  {
    key: "tone",
    lexicon_title: "chuzi_ai_step_tone",
    lexicon_hint: "chuzi_ai_step_tone_hint",
    required: false,
  },
];
