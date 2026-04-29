/**
 * Spatial distribution helpers for the wilds realm. Trees grow in clumps
 * (groves), not on a uniform grid: pick a small set of cluster anchors,
 * then scatter trees around them with a soft falloff. Deterministic when a
 * seed is provided so the same catalog produces the same forest.
 */

export type Vec3 = [number, number, number];

export interface DistributeForestOptions {
  /** Outer radius the forest occupies, in world units. */
  radius?: number;
  /** Number of clumps. Capped at `count`. */
  clumpCount?: number;
  /** Spread of each clump (stddev-ish, in world units). */
  clumpSpread?: number;
  /** Deterministic seed; identical seeds produce identical layouts. */
  seed?: number;
}

/**
 * Cluster trees around a small number of anchor points, with each anchor
 * placed in a disk of `radius`. Each tree is offset from its anchor by a
 * 2D gaussian-ish jitter (`clumpSpread`). Y is always 0 — trees stand on
 * the ground plane.
 */
export function distributeForest(
  count: number,
  options: DistributeForestOptions = {},
): Vec3[] {
  const radius = options.radius ?? 28;
  const clumpSpread = options.clumpSpread ?? 4;
  const random = options.seed !== undefined ? mulberry32(options.seed) : Math.random;

  const desiredClumps = options.clumpCount ?? Math.max(2, Math.round(count / 4));
  const clumpCount = Math.max(1, Math.min(count, desiredClumps));

  const anchors: Vec3[] = [];
  for (let i = 0; i < clumpCount; i++) {
    const r = Math.sqrt(random()) * radius;
    const theta = random() * Math.PI * 2;
    anchors.push([Math.cos(theta) * r, 0, Math.sin(theta) * r]);
  }

  const positions: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const anchor = anchors[i % clumpCount];
    const dx = gaussian(random) * clumpSpread;
    const dz = gaussian(random) * clumpSpread;
    positions.push([anchor[0] + dx, 0, anchor[2] + dz]);
  }
  return positions;
}

function gaussian(random: () => number): number {
  // Box–Muller. Two uniforms in, one ~N(0,1) out.
  const u1 = Math.max(1e-9, random());
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
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
