/**
 * Input abstraction. Pointer / touch / D-pad / accessibility nav all emit
 * the *same* `IntentEvent` stream. Realm components and the navigation rig
 * consume intents only — they never know which physical device produced
 * them.
 *
 * This is the load-bearing primitive for cross-platform UX: the TV D-pad
 * does focus-snap, the mouse does free flight, but both speak `MOVE`.
 */

export const Intent = {
  /** Free-flight delta (pointer/touch) OR discrete direction-snap (dpad). */
  MOVE: "MOVE",
  /** Engage the focused atom — open the player / detail view. */
  ENGAGE: "ENGAGE",
  /** Pop one level (close detail, exit search, leave realm-switcher). */
  BACK: "BACK",
  /** Open filter / search overlay. */
  FILTER: "FILTER",
  /** Hold-to-peek: preview detail without committing to ENGAGE. */
  PEEK: "PEEK",
  /** Pull camera back to a wider zoom level. */
  ZOOM_OUT: "ZOOM_OUT",
  /** Push camera forward to a tighter zoom level. */
  ZOOM_IN: "ZOOM_IN",
  /** Move focus to next/prev atom in current group (sibling cycling). */
  CYCLE_NEXT: "CYCLE_NEXT",
  CYCLE_PREV: "CYCLE_PREV",
  /** Auto-tour: fly between matches/recommendations hands-free. */
  TOUR_START: "TOUR_START",
  TOUR_STOP: "TOUR_STOP",
} as const;

export type IntentName = (typeof Intent)[keyof typeof Intent];

export type InputMode = "pointer" | "touch" | "dpad" | "a11y";

export type Direction = "up" | "down" | "left" | "right";

export interface IntentEvent {
  intent: IntentName;
  /** For pointer/touch MOVE: continuous look/thrust delta in normalized units. */
  delta?: { x: number; y: number; z?: number };
  /** For ZOOM_IN/ZOOM_OUT: amount in normalized units. */
  amount?: number;
  /** For dpad MOVE: discrete direction. */
  direction?: Direction;
  /** Which physical device produced this intent. */
  source: InputMode;
  /** performance.now() at emission, for timing-sensitive consumers. */
  at: number;
}

/**
 * Bridge between a physical input (pointerlock, touch handlers, key events,
 * D-pad on remote, screen reader) and the realm's nav rig. Implementations
 * own their own listeners; consumers only subscribe.
 */
export interface IntentSource {
  subscribe(handler: (e: IntentEvent) => void): () => void;
  /** Begin listening to the underlying physical input (called by host). */
  start?(): void;
  /** Tear down listeners (called when realm or app unmounts). */
  stop?(): void;
}

/**
 * Compose multiple sources into one. Useful for surfaces that accept both
 * pointer and gamepad input simultaneously (e.g. desktop dev mode).
 */
export function mergeIntentSources(...sources: IntentSource[]): IntentSource {
  return {
    subscribe(handler) {
      const unsubs = sources.map((s) => s.subscribe(handler));
      return () => unsubs.forEach((u) => u());
    },
    start() {
      sources.forEach((s) => s.start?.());
    },
    stop() {
      sources.forEach((s) => s.stop?.());
    },
  };
}
