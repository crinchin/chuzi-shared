/** Curated free Google Fonts for scene text — Chuzi AI picks from `id` values. */
export interface SceneTextFont {
  /** Stored in `text_style.font_family` and sent to Chuzi AI. */
  id: string;
  /** Editor dropdown label. */
  label: string;
  /** CSS `font-family` stack. */
  family: string;
  /** Google Fonts CSS2 family spec (e.g. `Bebas+Neue`). */
  googleSpec: string;
  /** Short mood hint for AI prompt copy. */
  mood: string;
}

export const SCENE_TEXT_FONT_DEFAULT_ID = "Playfair Display";

/** Padding that keeps prose clear of the bottom-right continue arrow. */
export const SCENE_TEXT_ARROW_SAFE_INSET = {
  top: "5%",
  left: "5%",
  right: "20%",
  bottom: "22%",
} as const;

export const SCENE_TEXT_FONTS: readonly SceneTextFont[] = [
  { id: "inherit", label: "Site Default", family: "inherit", googleSpec: "", mood: "neutral system" },
  { id: "Playfair Display", label: "Playfair Display", family: '"Playfair Display", Georgia, serif', googleSpec: "Playfair+Display:wght@400;700", mood: "literary drama" },
  { id: "Cinzel", label: "Cinzel", family: "Cinzel, Georgia, serif", googleSpec: "Cinzel:wght@400;700", mood: "epic classical" },
  { id: "Cormorant Garamond", label: "Cormorant Garamond", family: '"Cormorant Garamond", Georgia, serif', googleSpec: "Cormorant+Garamond:wght@400;700", mood: "elegant romance" },
  { id: "EB Garamond", label: "EB Garamond", family: '"EB Garamond", Georgia, serif', googleSpec: "EB+Garamond:wght@400;700", mood: "old-world book" },
  { id: "Libre Baskerville", label: "Libre Baskerville", family: '"Libre Baskerville", Georgia, serif', googleSpec: "Libre+Baskerville:wght@400;700", mood: "vintage mystery" },
  { id: "Merriweather", label: "Merriweather", family: "Merriweather, Georgia, serif", googleSpec: "Merriweather:wght@400;700", mood: "warm readable serif" },
  { id: "Lora", label: "Lora", family: "Lora, Georgia, serif", googleSpec: "Lora:wght@400;700", mood: "soft literary" },
  { id: "Spectral", label: "Spectral", family: "Spectral, Georgia, serif", googleSpec: "Spectral:wght@400;700", mood: "editorial serif" },
  { id: "Crimson Text", label: "Crimson Text", family: '"Crimson Text", Georgia, serif', googleSpec: "Crimson+Text:wght@400;700", mood: "poetic classic" },
  { id: "Georgia", label: "Georgia", family: "Georgia, serif", googleSpec: "", mood: "traditional serif" },
  { id: "Times New Roman", label: "Times New Roman", family: '"Times New Roman", Times, serif', googleSpec: "", mood: "formal print" },
  { id: "Bebas Neue", label: "Bebas Neue", family: '"Bebas Neue", Impact, sans-serif', googleSpec: "Bebas+Neue", mood: "bold poster" },
  { id: "Anton", label: "Anton", family: "Anton, Impact, sans-serif", googleSpec: "Anton", mood: "loud headline" },
  { id: "Oswald", label: "Oswald", family: "Oswald, Arial, sans-serif", googleSpec: "Oswald:wght@400;700", mood: "condensed tension" },
  { id: "Barlow Condensed", label: "Barlow Condensed", family: '"Barlow Condensed", Arial, sans-serif', googleSpec: "Barlow+Condensed:wght@400;700", mood: "noir narrow" },
  { id: "Montserrat", label: "Montserrat", family: "Montserrat, Arial, sans-serif", googleSpec: "Montserrat:wght@400;700", mood: "modern clean" },
  { id: "Raleway", label: "Raleway", family: "Raleway, Arial, sans-serif", googleSpec: "Raleway:wght@400;700", mood: "airy minimal" },
  { id: "Poppins", label: "Poppins", family: "Poppins, Arial, sans-serif", googleSpec: "Poppins:wght@400;700", mood: "friendly sans" },
  { id: "Josefin Sans", label: "Josefin Sans", family: '"Josefin Sans", Arial, sans-serif', googleSpec: "Josefin+Sans:wght@400;700", mood: "retro art deco" },
  { id: "Roboto", label: "Roboto", family: "Roboto, Arial, sans-serif", googleSpec: "Roboto:wght@400;700", mood: "neutral sans" },
  { id: "Arial", label: "Arial", family: "Arial, Helvetica, sans-serif", googleSpec: "", mood: "plain sans" },
  { id: "Helvetica", label: "Helvetica", family: "Helvetica, Arial, sans-serif", googleSpec: "", mood: "swiss sans" },
  { id: "Verdana", label: "Verdana", family: "Verdana, Geneva, sans-serif", googleSpec: "", mood: "screen sans" },
  { id: "Abril Fatface", label: "Abril Fatface", family: '"Abril Fatface", Georgia, serif', googleSpec: "Abril+Fatface", mood: "luxury display" },
  { id: "Alfa Slab One", label: "Alfa Slab One", family: '"Alfa Slab One", Georgia, serif', googleSpec: "Alfa+Slab+One", mood: "western slab" },
  { id: "Bungee", label: "Bungee", family: "Bungee, Impact, sans-serif", googleSpec: "Bungee", mood: "urban shout" },
  { id: "Righteous", label: "Righteous", family: "Righteous, Impact, sans-serif", googleSpec: "Righteous", mood: "retro funk" },
  { id: "Lobster", label: "Lobster", family: "Lobster, cursive", googleSpec: "Lobster", mood: "playful script" },
  { id: "Pacifico", label: "Pacifico", family: "Pacifico, cursive", googleSpec: "Pacifico", mood: "surf casual" },
  { id: "Dancing Script", label: "Dancing Script", family: '"Dancing Script", cursive', googleSpec: "Dancing+Script:wght@400;700", mood: "romantic hand" },
  { id: "Caveat", label: "Caveat", family: "Caveat, cursive", googleSpec: "Caveat:wght@400;700", mood: "notebook scribble" },
  { id: "Sacramento", label: "Sacramento", family: "Sacramento, cursive", googleSpec: "Sacramento", mood: "elegant script" },
  { id: "Satisfy", label: "Satisfy", family: "Satisfy, cursive", googleSpec: "Satisfy", mood: "loose signature" },
  { id: "Permanent Marker", label: "Permanent Marker", family: '"Permanent Marker", cursive', googleSpec: "Permanent+Marker", mood: "graffiti marker" },
  { id: "Special Elite", label: "Special Elite", family: '"Special Elite", monospace', googleSpec: "Special+Elite", mood: "typewriter noir" },
  { id: "Courier Prime", label: "Courier Prime", family: '"Courier Prime", monospace', googleSpec: "Courier+Prime:wght@400;700", mood: "manuscript mono" },
  { id: "Courier New", label: "Courier New", family: '"Courier New", Courier, monospace', googleSpec: "", mood: "terminal mono" },
  { id: "Space Mono", label: "Space Mono", family: '"Space Mono", monospace', googleSpec: "Space+Mono:wght@400;700", mood: "sci-fi mono" },
  { id: "VT323", label: "VT323", family: "VT323, monospace", googleSpec: "VT323", mood: "arcade terminal" },
  { id: "Press Start 2P", label: "Press Start 2P", family: '"Press Start 2P", monospace', googleSpec: "Press+Start+2P", mood: "8-bit game" },
  { id: "Creepster", label: "Creepster", family: "Creepster, fantasy", googleSpec: "Creepster", mood: "horror drip" },
  { id: "UnifrakturMaguntia", label: "UnifrakturMaguntia", family: "UnifrakturMaguntia, fantasy", googleSpec: "UnifrakturMaguntia", mood: "gothic blackletter" },
  { id: "Rubik Glitch", label: "Rubik Glitch", family: '"Rubik Glitch", fantasy', googleSpec: "Rubik+Glitch", mood: "glitch chaos" },
  { id: "Rubik Wet Paint", label: "Rubik Wet Paint", family: '"Rubik Wet Paint", fantasy', googleSpec: "Rubik+Wet+Paint", mood: "melting wild" },
  { id: "Titan One", label: "Titan One", family: '"Titan One", fantasy', googleSpec: "Titan+One", mood: "cartoon punch" },
  { id: "Bangers", label: "Bangers", family: "Bangers, fantasy", googleSpec: "Bangers", mood: "comic blast" },
  { id: "Fredericka the Great", label: "Fredericka the Great", family: '"Fredericka the Great", fantasy', googleSpec: "Fredericka+the+Great", mood: "ornate fantasy" },
  { id: "Eater", label: "Eater", family: "Eater, fantasy", googleSpec: "Eater", mood: "creepy bite" },
  { id: "Nosifer", label: "Nosifer", family: "Nosifer, fantasy", googleSpec: "Nosifer", mood: "blood drip" },
  { id: "Metal Mania", label: "Metal Mania", family: '"Metal Mania", fantasy', googleSpec: "Metal+Mania", mood: "heavy metal" },
  { id: "Rye", label: "Rye", family: "Rye, fantasy", googleSpec: "Rye", mood: "wanted poster" },
  { id: "Pirata One", label: "Pirata One", family: '"Pirata One", fantasy', googleSpec: "Pirata+One", mood: "pirate adventure" },
  { id: "Fascinate Inline", label: "Fascinate Inline", family: '"Fascinate Inline", fantasy', googleSpec: "Fascinate+Inline", mood: "disco inline" },
] as const;

const FONT_BY_ID = new Map(SCENE_TEXT_FONTS.map((font) => [font.id.toLowerCase(), font]));
const FONT_BY_FAMILY = new Map(
  SCENE_TEXT_FONTS.flatMap((font) => [
    [font.family.toLowerCase(), font],
    [font.id.toLowerCase(), font],
  ]),
);

/** Font ids Chuzi AI may choose (excludes inherit / system-only). */
export const CHUZI_AI_SCENE_FONT_IDS: readonly string[] = SCENE_TEXT_FONTS
  .filter((font) => font.id !== "inherit")
  .map((font) => font.id);

export function chuziAiSceneFontPromptList(): string {
  return CHUZI_AI_SCENE_FONT_IDS.join("|");
}

export function resolveSceneTextFont(stored?: string | null): SceneTextFont {
  const raw = (stored ?? "").trim();
  if (!raw || raw === "inherit") {
    return FONT_BY_ID.get("inherit") ?? SCENE_TEXT_FONTS[0];
  }

  const byId = FONT_BY_ID.get(raw.toLowerCase());
  if (byId) return byId;

  const byFamily = FONT_BY_FAMILY.get(raw.toLowerCase());
  if (byFamily) return byFamily;

  // Legacy values like "Arial, sans-serif"
  const legacy = SCENE_TEXT_FONTS.find((font) =>
    raw.toLowerCase().includes(font.id.toLowerCase()),
  );
  if (legacy) return legacy;

  return {
    id: raw,
    label: raw,
    family: raw,
    googleSpec: "",
    mood: "custom",
  };
}

export function sceneTextFontCss(stored?: string | null): string {
  return resolveSceneTextFont(stored).family;
}

export function sceneTextFontOptions(): { value: string; label: string; family: string }[] {
  return SCENE_TEXT_FONTS.map((font) => ({
    value: font.id,
    label: font.label,
    family: font.family,
  }));
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** Build Google Fonts CSS2 URLs (chunked to stay under URL length limits). */
export function buildSceneTextFontStylesheetUrls(): string[] {
  const specs = SCENE_TEXT_FONTS
    .map((font) => font.googleSpec)
    .filter(Boolean);
  return chunk(specs, 12).map((group) => {
    const query = group.map((spec) => `family=${spec}`).join("&");
    return `https://fonts.googleapis.com/css2?${query}&display=swap`;
  });
}

/** Inject link tags for all scene text fonts (idempotent). */
export function ensureSceneTextFontsLoaded(doc: Document = document): void {
  const head = doc.head;
  buildSceneTextFontStylesheetUrls().forEach((href, index) => {
    const id = `chuzi-scene-fonts-${index}`;
    if (head.querySelector(`link#${id}`)) return;
    const link = doc.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
  });
}
