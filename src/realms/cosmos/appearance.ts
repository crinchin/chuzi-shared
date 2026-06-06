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
  /** World-space lift above constellation center. */
  titleYOffset: number;
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
  labelGap: number;
  /** Reserved space below preview for the 2×2 HUD control grid (px). */
  controlsGridHeight: number;
  billboardDistanceFactor: number;

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
  titleYOffset: 8,
  titleDistanceFactor: 12,
  htmlZIndexRange: [8, 0],

  previewWidth: 148,
  previewHeight: 96,
  previewOffsetY: 2.4,
  labelFontSize: 13,
  labelLetterSpacing: 1.2,
  labelGap: 10,
  controlsGridHeight: 92,
  billboardDistanceFactor: 10,

  cameraDefaultOffset: [0, 4, 12],
  cameraTargetOffset: [0, 0, 0],
  cameraSlideLerp: 0.035,
  cameraArrivalThreshold: 0.08,
};

export function mergeConstellationAppearance(
  overrides?: Partial<ConstellationAppearance>,
): ConstellationAppearance {
  return { ...DEFAULT_CONSTELLATION_APPEARANCE, ...overrides };
}
