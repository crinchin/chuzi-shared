/**
 * Guided prompts for Chuzi AI story creation.
 * Based on Dan Harmon's Story Circle and Joseph Campbell's Hero's Journey.
 */

export interface ChuziAiPromptStep {
  key: string;
  lexicon_title: string;
  lexicon_hint: string;
  /** Monomyth stage reference shown in the UI */
  monomyth_ref?: string;
  required?: boolean;
}

export const CHUZI_AI_PROMPT_STEPS: ChuziAiPromptStep[] = [
  {
    key: "hero",
    lexicon_title: "chuzi_ai_step_hero",
    lexicon_hint: "chuzi_ai_step_hero_hint",
    monomyth_ref: "chuzi_ai_monomyth_hero",
    required: true,
  },
  {
    key: "world",
    lexicon_title: "chuzi_ai_step_world",
    lexicon_hint: "chuzi_ai_step_world_hint",
    monomyth_ref: "chuzi_ai_monomyth_world",
    required: true,
  },
  {
    key: "you",
    lexicon_title: "chuzi_ai_step_you",
    lexicon_hint: "chuzi_ai_step_you_hint",
    monomyth_ref: "chuzi_ai_monomyth_you",
    required: true,
  },
  {
    key: "need",
    lexicon_title: "chuzi_ai_step_need",
    lexicon_hint: "chuzi_ai_step_need_hint",
    monomyth_ref: "chuzi_ai_monomyth_need",
    required: true,
  },
  {
    key: "go",
    lexicon_title: "chuzi_ai_step_go",
    lexicon_hint: "chuzi_ai_step_go_hint",
    monomyth_ref: "chuzi_ai_monomyth_go",
    required: true,
  },
  {
    key: "search",
    lexicon_title: "chuzi_ai_step_search",
    lexicon_hint: "chuzi_ai_step_search_hint",
    monomyth_ref: "chuzi_ai_monomyth_search",
    required: false,
  },
  {
    key: "find",
    lexicon_title: "chuzi_ai_step_find",
    lexicon_hint: "chuzi_ai_step_find_hint",
    monomyth_ref: "chuzi_ai_monomyth_find",
    required: false,
  },
  {
    key: "take",
    lexicon_title: "chuzi_ai_step_take",
    lexicon_hint: "chuzi_ai_step_take_hint",
    monomyth_ref: "chuzi_ai_monomyth_take",
    required: false,
  },
  {
    key: "return",
    lexicon_title: "chuzi_ai_step_return",
    lexicon_hint: "chuzi_ai_step_return_hint",
    monomyth_ref: "chuzi_ai_monomyth_return",
    required: false,
  },
  {
    key: "change",
    lexicon_title: "chuzi_ai_step_change",
    lexicon_hint: "chuzi_ai_step_change_hint",
    monomyth_ref: "chuzi_ai_monomyth_change",
    required: false,
  },
  {
    key: "tone",
    lexicon_title: "chuzi_ai_step_tone",
    lexicon_hint: "chuzi_ai_step_tone_hint",
    required: false,
  },
];
