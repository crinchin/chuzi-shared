import type { RealmId, StoryListItem } from "../types/index.js";

/**
 * Realm rendering contract. Each realm (cosmos, wilds, future depths/etc)
 * implements this interface and ships as a self-contained subpath module
 * (`@chuzi/shared/realms/cosmos`, `@chuzi/shared/realms/wilds`, ...).
 *
 * Apps don't import realms directly — they read `user.realm`, then dynamic-
 * import the matching module. Adding a new realm is a one-package change
 * with zero modifications to app code.
 *
 * The `Component` generic is left abstract so this contract works for any
 * renderer. Web/TV apps satisfy it with `React.ComponentType`; React Native
 * apps satisfy it with their own component type. chuzi-shared itself stays
 * dependency-free.
 */

/** State badge applied to an atom regardless of realm. Realms render it
 *  in their own visual language (orbit ring, marker post, glow, etc.). */
export type AtomState = "default" | "watched" | "bookmarked" | "in_progress" | "new";

/** Continuous zoom levels. Camera flies smoothly between them; LOD swaps
 *  geometry/asset quality as it crosses thresholds. */
export type ZoomLevel = "overview" | "sector" | "atom";

export interface AtomVisualProps {
  /** Position in realm-space (the realm decides the coordinate convention). */
  position: [number, number, number];
  /** Relative scale, 0–1 normalized. Realms map this to height/girth/etc. */
  scale: number;
  /** Realm-interpretable hue, 0–360. Cosmos: stellar class. Wilds: foliage. */
  hue: number;
  /** Realm-interpretable intensity, 0–1. Cosmos: luminosity. Wilds: density. */
  intensity: number;
  /** Cross-realm state badge. */
  state: AtomState;
  /** Pass-through metadata for realm-specific rendering. */
  metadata: {
    title: string;
    runtime?: number;
    popularity?: number;
    mood?: string;
    genre?: string | null;
  };
}

export type AtomMapping = (film: StoryListItem) => AtomVisualProps;

export interface AudioPalette {
  /** Looping ambient bed (deep-space rumble, forest wind, ocean swell, ...). */
  ambientLoop?: string;
  /** Plays when focus moves to a new atom. */
  focusChime?: string;
  /** Plays during the engage transition into the player. */
  engageImpact?: string;
  /** Plays during the back transition out of the player. */
  backWhoosh?: string;
}

export interface MotionTokens {
  /** Free-flight responsiveness (pointer/touch). */
  flightAcceleration: number;
  flightDamping: number;
  /** D-pad / focus-snap easing duration in ms. */
  focusEaseMs: number;
  /** Length of the engage transition (atom → player) in ms. */
  engageDurationMs: number;
  /** Length of the back transition (player → atom) in ms. Should equal
   *  engageDurationMs by default — symmetric transitions feel grounded. */
  backDurationMs: number;
}

/** A geometric atom in realm-space, used by `focusSnap` to compute the
 *  best neighbor in a given direction. Realms get the bare minimum and
 *  decide how to weight (e.g. cosmos prefers angular alignment, wilds
 *  prefers walking distance along the floor plane). */
export interface AtomLocation {
  id: string;
  position: [number, number, number];
}

export type FocusSnap = (
  currentId: string,
  direction: "up" | "down" | "left" | "right",
  atoms: AtomLocation[],
) => string | null;

/**
 * The full realm module. `Component` is whatever component type the host
 * renderer expects (see file-level doc).
 */
export interface RealmModule<Component = unknown> {
  id: RealmId;

  /** The environment: skybox / canopy / ocean / city. */
  World: Component;
  /** A single film embodied (Star, Tree, Bioluminescent organism, ...). */
  Atom: Component;
  /** A curated grouping (Constellation, Grove, Reef, ...). */
  Group: Component;
  /** Camera + motion controller. Receives an `IntentSource` prop and
   *  maps intents to realm-specific motion. */
  NavRig: Component;
  /** The signature transition: atom expands to fill the screen and
   *  hands off to the player surface. Reverses on close. */
  EngageTransition: Component;

  /** Maps shared catalog data → realm-specific visual props. */
  mapping: AtomMapping;

  /** Realm-specific audio bed and stingers. */
  audio: AudioPalette;

  /** Realm-specific timing/easing constants. */
  motion: MotionTokens;

  /** D-pad neighbor selection algorithm. Realms own the spatial weighting. */
  focusSnap: FocusSnap;
}

/**
 * Default focus-snap implementation: pick the atom closest to a 60°
 * directional cone from the current atom. Realms can replace this when
 * their geometry calls for different weighting.
 */
export function defaultFocusSnap(
  currentId: string,
  direction: "up" | "down" | "left" | "right",
  atoms: AtomLocation[],
): string | null {
  const current = atoms.find((a) => a.id === currentId);
  if (!current) return null;

  const dirVec: [number, number] =
    direction === "left" ? [-1, 0]
    : direction === "right" ? [1, 0]
    : direction === "up" ? [0, 1]
    : [0, -1];

  let best: { id: string; score: number } | null = null;
  for (const a of atoms) {
    if (a.id === currentId) continue;
    const dx = a.position[0] - current.position[0];
    const dy = a.position[1] - current.position[1];
    const dist = Math.hypot(dx, dy);
    if (dist === 0) continue;
    const dot = (dx * dirVec[0] + dy * dirVec[1]) / dist;
    // Cone of acceptance: dot > 0.5 ≈ within 60° of direction.
    if (dot < 0.5) continue;
    // Score: closer is better, more aligned is better.
    const score = dist / Math.max(dot, 0.001);
    if (!best || score < best.score) best = { id: a.id, score };
  }
  return best?.id ?? null;
}
