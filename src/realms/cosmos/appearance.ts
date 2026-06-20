/** Swirling dust motes around a launched constellation. */
export interface PublishedDustAppearance {
  enabled: boolean;
  count: number;
  /** Orbit radius multiplier relative to constellation span. */
  orbitRadius: number;
  /** Angular speed of the swirl. */
  speed: number;
  color: string;
  opacity: number;
}

/** Visual treatment applied when a story is published / launched. */
export interface PublishedEffectAppearance {
  enabled: boolean;
  /** Extra HSL saturation added to each star (0–50). */
  starSaturationBoost: number;
  /** Extra HSL lightness added to each star (0–30). */
  starLightnessBoost: number;
  /** Multiplier on edge glow and core opacity (1 = baseline). */
  edgeGlowMultiplier: number;
  dust: PublishedDustAppearance;
}

/** Visual treatment for the currently selected story system in my-realm. */
export interface FocusEffectAppearance {
  enabled: boolean;
  /** Star mesh pulse amplitude when the system is focused (0–0.5). */
  starPulseAmplitude: number;
  /** Star mesh pulse speed in Hz. */
  starPulseSpeed: number;
  /** Multiplier on focus halo shell scale. */
  glowScale: number;
  /** Extra opacity added to focus halo layers. */
  glowOpacityBoost: number;
  /** Expanding ring burst when selection changes. */
  shockwaveEnabled: boolean;
  /** Point light intensity at the focused anchor. */
  pointLightIntensity: number;
}

/**
 * Constellation presentation tokens — consumed by the cosmos realm camera,
 * star billboards, and ghost title typography. Admins can override via
 * saved experience / appearance templates.
 */
export interface ConstellationAppearance {
  /** Rainbow arc title above the constellation (SVG px). */
  titleFontSize: number;
  titleOpacity: number;
  titleColor: string;
  titleLetterSpacing: number;
  /** World-space lift relative to constellation center (negative = below). */
  titleYOffset: number;
  /** Gap between focused preview controls and inline story title (px). */
  titleBelowPreviewGap: number;
  /** Inline title under preview — smaller arc typography (SVG px). */
  titleBelowPreviewFontSize: number;
  /** Html distance factor for the arc title billboard. */
  titleDistanceFactor: number;
  /** DOM z-index ceiling for constellation Html overlays (keep below editor). */
  htmlZIndexRange: [number, number];

  /** Per-star preview card + label. */
  previewWidth: number;
  previewHeight: number;
  previewOffsetY: number;
  labelFontSize: number;
  labelLetterSpacing: number;
  /** Max width for scene labels beneath preview cards (px). */
  labelMaxWidth: number;
  labelGap: number;
  /** Reserved space below preview for the 2×2 HUD control grid (px). */
  controlsGridHeight: number;
  billboardDistanceFactor: number;
  /** Scene names beneath preview cards (off by default — title lives on the arc). */
  showSceneLabels: boolean;

  /** Launched-story shimmer: brighter stars, edges, and optional dust swirl. */
  publishedEffect: PublishedEffectAppearance;

  /** Selected-system pulse, halo, and shockwave in my-realm browse mode. */
  focusEffect: FocusEffectAppearance;

  /** Camera — floating-in-space slide between stars. */
  cameraDefaultOffset: [number, number, number];
  cameraTargetOffset: [number, number, number];
  /** 0–1 lerp factor per frame while gliding (lower = smoother / pressurized). */
  cameraSlideLerp: number;
  cameraArrivalThreshold: number;
}

export const DEFAULT_CONSTELLATION_APPEARANCE: ConstellationAppearance = {
  titleFontSize: 34,
  titleOpacity: 0.82,
  titleColor: "#c8dce8",
  titleLetterSpacing: 6,
  titleYOffset: -2.5,
  titleBelowPreviewGap: 6,
  titleBelowPreviewFontSize: 22,
  titleDistanceFactor: 12,
  htmlZIndexRange: [8, 0],

  previewWidth: 192,
  previewHeight: 124,
  previewOffsetY: 2.4,
  labelFontSize: 13,
  labelLetterSpacing: 1.2,
  labelMaxWidth: 240,
  labelGap: 10,
  controlsGridHeight: 92,
  billboardDistanceFactor: 10,
  showSceneLabels: false,

  publishedEffect: {
    enabled: true,
    starSaturationBoost: 18,
    starLightnessBoost: 14,
    edgeGlowMultiplier: 1.65,
    dust: {
      enabled: true,
      count: 28,
      orbitRadius: 1.35,
      speed: 0.42,
      color: "#c8dce8",
      opacity: 0.5,
    },
  },

  focusEffect: {
    enabled: true,
    starPulseAmplitude: 0.22,
    starPulseSpeed: 2.4,
    glowScale: 1.45,
    glowOpacityBoost: 0.12,
    shockwaveEnabled: true,
    pointLightIntensity: 2.8,
  },

  cameraDefaultOffset: [0, 4, 12],
  cameraTargetOffset: [0, 0, 0],
  cameraSlideLerp: 0.035,
  cameraArrivalThreshold: 0.08,
};

export function mergeConstellationAppearance(
  overrides?: Partial<ConstellationAppearance>,
): ConstellationAppearance {
  const base = { ...DEFAULT_CONSTELLATION_APPEARANCE, ...overrides };
  if (overrides?.publishedEffect) {
    base.publishedEffect = {
      ...DEFAULT_CONSTELLATION_APPEARANCE.publishedEffect,
      ...overrides.publishedEffect,
      dust: {
        ...DEFAULT_CONSTELLATION_APPEARANCE.publishedEffect.dust,
        ...overrides.publishedEffect.dust,
      },
    };
  }
  if (overrides?.focusEffect) {
    base.focusEffect = {
      ...DEFAULT_CONSTELLATION_APPEARANCE.focusEffect,
      ...overrides.focusEffect,
    };
  }
  return base;
}
