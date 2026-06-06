import type { StoryListItem } from "../../types/index.js";
import type { AtomMapping, AtomState, AudioPalette, MotionTokens } from "../index.js";

/**
 * COSMOS realm — pure-data layer. The 3D components (World, Star, NavRig,
 * EngageTransition) live in a follow-up package once the JSX build is
 * wired up; this file owns the realm's mapping and tuning constants so
 * they can be consumed today by any non-3D surface (catalog list, search,
 * preview cards, sound design tooling).
 *
 * Mapping rationale:
 *   runtime    → scale         (longer film = bigger star)
 *   popularity → intensity     (more watches = brighter)
 *   mood       → hue           (warm/cool palette by tone)
 *   genre      → spectral hint (small offset on top of mood, reads as
 *                              "stellar class" — drama is yellow-G,
 *                              thriller is blue-O, romance is red-M).
 *   state      → orbit-ring rendering (handled by Atom component).
 */

const GENRE_HUE_OFFSET: Record<string, number> = {
  drama: 50,
  thriller: 220,
  horror: 0,
  comedy: 35,
  romance: 340,
  scifi: 200,
  documentary: 180,
  animation: 280,
};

const MOOD_HUE: Record<string, number> = {
  bright: 50,
  warm: 25,
  bittersweet: 290,
  somber: 230,
  tense: 210,
  playful: 110,
  melancholy: 250,
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function popularityToIntensity(film: StoryListItem): number {
  // Log-compress: a 100x more-watched film should not be 100x brighter.
  const watches = Math.max(0, film.watch_starts_count);
  const log = Math.log10(1 + watches);
  // Rough cap at ~6 (1M watches saturates the scale).
  return clamp01(log / 6);
}

function deriveScale(film: StoryListItem): number {
  // We don't have runtime in StoryListItem yet; proxy with scenes_count.
  // Caps the starfield from going visually noisy.
  const scenes = film.scenes_count ?? 1;
  return clamp01(0.25 + Math.log10(1 + scenes) / 4);
}

function deriveHue(film: StoryListItem): number {
  const genreKey = (film.genre ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const moodKey = "";
  const moodHue = MOOD_HUE[moodKey];
  const genreOffset = GENRE_HUE_OFFSET[genreKey];
  if (moodHue !== undefined) return moodHue;
  if (genreOffset !== undefined) return genreOffset;
  return 210;
}

function deriveState(film: StoryListItem): AtomState {
  // Without per-user progress threaded through, default; the consuming
  // app will overlay state from CatalogResponse.meta.progress.
  return film.published ? "default" : "new";
}

export const cosmosMapping: AtomMapping = (film) => ({
  position: [0, 0, 0], // assigned by the realm's spatial layouter
  scale: deriveScale(film),
  hue: deriveHue(film),
  intensity: popularityToIntensity(film),
  state: deriveState(film),
  metadata: {
    title: film.title,
    popularity: film.watch_starts_count,
    genre: film.genre,
  },
});

export const cosmosMotion: MotionTokens = {
  flightAcceleration: 14,
  flightDamping: 0.92,
  focusEaseMs: 380,
  engageDurationMs: 900,
  backDurationMs: 900,
};

export {
  DEFAULT_CONSTELLATION_APPEARANCE,
  mergeConstellationAppearance,
} from "./appearance.js";
export type { ConstellationAppearance } from "./appearance.js";

export const cosmosAudio: AudioPalette = {
  // Asset paths are resolved by the host app's asset bundler; chuzi-shared
  // only declares the contract. Replace with CDN URLs at integration time.
  ambientLoop: "audio/cosmos/ambient-deep.ogg",
  focusChime: "audio/cosmos/focus-shimmer.ogg",
  engageImpact: "audio/cosmos/dolly-in.ogg",
  backWhoosh: "audio/cosmos/dolly-out.ogg",
};
