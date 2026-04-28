/**
 * Spatial distribution helpers for the cosmos realm. Kept as a stand-alone
 * module so non-3D surfaces (search overlays, accessibility list view,
 * minimap) can compute and reuse positions without pulling in three.js.
 */

export type Vec3 = [number, number, number];

export interface DistributeOptions {
  /** Outer radius of the disk in world units. */
  radius?: number;
  /** Vertical jitter band (±). Larger values flatten the disk less. */
  thickness?: number;
  /** Deterministic seed; identical seeds produce identical layouts. */
  seed?: number;
}

/**
 * Galaxy-disk distribution: stars cluster denser toward the center
 * (sqrt-r weighting), with a vertical jitter band. Deterministic when a
 * seed is provided so the same catalog produces the same starfield across
 * sessions.
 */
export function distributeStars(
  count: number,
  options: DistributeOptions = {},
): Vec3[] {
  const radius = options.radius ?? 25;
  const thickness = options.thickness ?? 4;
  const random = options.seed !== undefined ? mulberry32(options.seed) : Math.random;

  const positions: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(random()) * radius;
    const theta = random() * Math.PI * 2;
    const y = (random() - 0.5) * thickness;
    positions.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return positions;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
