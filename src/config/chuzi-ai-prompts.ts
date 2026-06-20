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
  "absurdist",
  "action",
  "adventure",
  "afrofuturism",
  "biopunk",
  "cli-fi",
  "comedy",
  "cozy",
  "cyberpunk",
  "dieselpunk",
  "drama",
  "dystopian",
  "espionage",
  "fantasy",
  "gothic",
  "grimdark",
  "historical",
  "horror",
  "isekai",
  "magical-realism",
  "mystery",
  "mythology",
  "noir",
  "post-apocalyptic",
  "psychological",
  "romance",
  "satire",
  "sci-fi",
  "slice-of-life",
  "solarpunk",
  "space-opera",
  "steampunk",
  "supernatural",
  "surreal",
  "thriller",
  "western",
  "wuxia",
] as const;

export type ChuziAiVibe = (typeof CHUZI_AI_GENERATOR_VIBES)[number];

export const CHUZI_AI_VIBE_LABELS: Record<ChuziAiVibe, string> = {
  "absurdist": "Absurdist",
  "action": "Action",
  "adventure": "Adventure",
  "afrofuturism": "Afrofuturism",
  "biopunk": "Biopunk",
  "cli-fi": "Cli-Fi",
  "comedy": "Comedy",
  "cozy": "Cozy",
  "cyberpunk": "Cyberpunk",
  "dieselpunk": "Dieselpunk",
  "drama": "Drama",
  "dystopian": "Dystopian",
  "espionage": "Espionage",
  "fantasy": "Fantasy",
  "gothic": "Gothic",
  "grimdark": "Grimdark",
  "historical": "Historical",
  "horror": "Horror",
  "isekai": "Isekai",
  "magical-realism": "Magical Realism",
  "mystery": "Mystery",
  "mythology": "Mythology",
  "noir": "Noir",
  "post-apocalyptic": "Post-Apocalyptic",
  "psychological": "Psychological",
  "romance": "Romance",
  "satire": "Satire",
  "sci-fi": "Sci-Fi",
  "slice-of-life": "Slice of Life",
  "solarpunk": "Solarpunk",
  "space-opera": "Space Opera",
  "steampunk": "Steampunk",
  "supernatural": "Supernatural",
  "surreal": "Surreal",
  "thriller": "Thriller",
  "western": "Western",
  "wuxia": "Wuxia",
};
