import type { StoryListItem } from "../../types/index.js";
import type { AtomMapping, AtomState, AudioPalette, MotionTokens } from "../index.js";

/**
 * WILDS realm — pure-data layer. Mirrors `cosmos/index.ts` shape but with
 * forest semantics: films are trees, runtime → height, popularity → canopy
 * density, genre → species, mood → foliage color.
 *
 * Mapping rationale:
 *   runtime    → scale       (longer film = taller tree)
 *   popularity → intensity   (more watches = lusher canopy)
 *   genre      → hue        (species: oak=drama yellow, pine=thriller cool
 *                            green, willow=romance pink-green, dead/gnarled
 *                            =horror umber)
 *   state      → marker post next to trunk (handled by Atom component).
 */

const GENRE_HUE: Record<string, number> = {
  drama: 70,        // oak — warm green-gold
  thriller: 150,    // pine — cool green
  horror: 25,       // dead/gnarled — burnt umber
  comedy: 95,       // birch — bright spring
  romance: 330,     // cherry blossom — pink
  scifi: 180,       // alien luminescent
  documentary: 110, // generic forest green
  animation: 280,   // fantasy violet
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function popularityToIntensity(film: StoryListItem): number {
  const watches = Math.max(0, film.watch_starts_count);
  const log = Math.log10(1 + watches);
  return clamp01(log / 6);
}

function deriveScale(film: StoryListItem): number {
  // Trees are noticeably more height-variable than stars are size-variable;
  // map to a wider band than cosmos uses.
  const scenes = film.scenes_count ?? 1;
  return clamp01(0.3 + Math.log10(1 + scenes) / 3);
}

function deriveHue(film: StoryListItem): number {
  const genreKey = (film.genre ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const hue = GENRE_HUE[genreKey];
  return hue !== undefined ? hue : 110;
}

function deriveState(film: StoryListItem): AtomState {
  return film.published ? "default" : "new";
}

export const wildsMapping: AtomMapping = (film) => ({
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

export const wildsMotion: MotionTokens = {
  // Walking is slower and more grounded than flying through space.
  flightAcceleration: 8,
  flightDamping: 0.86,
  focusEaseMs: 480,
  engageDurationMs: 1100,
  backDurationMs: 1100,
};

export const wildsAudio: AudioPalette = {
  ambientLoop: "audio/wilds/ambient-forest.ogg",
  focusChime: "audio/wilds/leaf-rustle.ogg",
  engageImpact: "audio/wilds/bark-open.ogg",
  backWhoosh: "audio/wilds/bark-close.ogg",
};
