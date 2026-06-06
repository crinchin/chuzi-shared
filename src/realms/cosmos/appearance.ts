/**
 * Constellation presentation tokens — consumed by the cosmos realm camera,
 * star billboards, and ghost title typography. Admins can override via
 * saved experience / appearance templates.
 */
export interface ConstellationAppearance {
  /** Ghost film title spanning the constellation. */
  titleFontSize: number;
  titleOpacity: number;
  titleColor: string;
  titleLetterSpacing: number;
  titleYOffset: number;

  /** Per-star preview card + label. */
  previewWidth: number;
  previewHeight: number;
  previewOffsetY: number;
  labelFontSize: number;
  labelLetterSpacing: number;
  labelGap: number;
  billboardDistanceFactor: number;

  /** Camera — floating-in-space slide between stars. */
  cameraDefaultOffset: [number, number, number];
  cameraTargetOffset: [number, number, number];
  /** 0–1 lerp factor per frame while gliding (lower = smoother / pressurized). */
  cameraSlideLerp: number;
  cameraArrivalThreshold: number;
}

export const DEFAULT_CONSTELLATION_APPEARANCE: ConstellationAppearance = {
  titleFontSize: 2.8,
  titleOpacity: 0.14,
  titleColor: "#e8f0ff",
  titleLetterSpacing: 0.35,
  titleYOffset: 1.2,

  previewWidth: 148,
  previewHeight: 96,
  previewOffsetY: 2.4,
  labelFontSize: 13,
  labelLetterSpacing: 1.2,
  labelGap: 14,
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
