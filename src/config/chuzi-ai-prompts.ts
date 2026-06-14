/**
 * Generator configuration for Chuzi AI story creation.
 * The new flow uses vibes (genre pills), character count, and freeform details
 * instead of the older multi-step protagonist/setting/conflict prompts.
 */

export interface ChuziAiPromptStep {
  key: string;
  lexicon_title: string;
  lexicon_hint: string;
  required?: boolean;
}

/** @deprecated Replaced by CHUZI_AI_GENERATOR_VIBES + the 3-question flow. */
export const CHUZI_AI_PROMPT_STEPS: ChuziAiPromptStep[] = [];

export const CHUZI_AI_GENERATOR_VIBES = [
  "fantasy",
  "sci-fi",
  "romance",
  "horror",
  "thriller",
  "mystery",
  "comedy",
  "drama",
  "action",
  "adventure",
  "dystopian",
  "historical",
  "supernatural",
  "noir",
  "slice-of-life",
  "cyberpunk",
  "steampunk",
  "magical-realism",
  "surreal",
  "gothic",
  "psychological",
  "western",
  "mythology",
  "afrofuturism",
  "solarpunk",
] as const;

export type ChuziAiVibe = (typeof CHUZI_AI_GENERATOR_VIBES)[number];

export const CHUZI_AI_VIBE_LABELS: Record<ChuziAiVibe, string> = {
  "fantasy": "Fantasy",
  "sci-fi": "Sci-Fi",
  "romance": "Romance",
  "horror": "Horror",
  "thriller": "Thriller",
  "mystery": "Mystery",
  "comedy": "Comedy",
  "drama": "Drama",
  "action": "Action",
  "adventure": "Adventure",
  "dystopian": "Dystopian",
  "historical": "Historical",
  "supernatural": "Supernatural",
  "noir": "Noir",
  "slice-of-life": "Slice of Life",
  "cyberpunk": "Cyberpunk",
  "steampunk": "Steampunk",
  "magical-realism": "Magical Realism",
  "surreal": "Surreal",
  "gothic": "Gothic",
  "psychological": "Psychological",
  "western": "Western",
  "mythology": "Mythology",
  "afrofuturism": "Afrofuturism",
  "solarpunk": "Solarpunk",
};
