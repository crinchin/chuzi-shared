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

/** World-space gap between adjacent scenes along the story spine. */
export const COSMOS_SCENE_LEVEL_SPACING = 6;

/** Branch spread multiplier for tree_graph x offsets. */
export const COSMOS_SCENE_BRANCH_SPACING = 1.1;

/** Minimum empty space between constellation bounds, in scene spacings. */
export const COSMOS_CONSTELLATION_GAP_SCENES = 2;

/** Halo around a lone title star before scenes load. */
export const COSMOS_DEFAULT_FOOTPRINT_RADIUS = 10;

/** Extra world units around the outermost scene for billboards / focus glow. */
export const COSMOS_CONSTELLATION_VISUAL_PADDING = 6;

export interface ConstellationLayoutScene {
  id: string;
  is_title?: boolean;
  is_end?: boolean;
  order?: number;
  created_at?: string;
}

export interface ConstellationLayoutNode {
  id: string;
  level: number;
  x: number;
  index?: number;
}

export interface ConstellationLayoutGraph {
  nodes: ConstellationLayoutNode[];
  meta?: { root_id?: string | null };
}

export interface ConstellationAnchorInput {
  id: string;
  footprintRadius: number;
}

export interface ConstellationAnchorOptions {
  /** Gap between constellation bounds in scene spacings (default 2). */
  minGapScenes?: number;
  levelSpacing?: number;
  visualPadding?: number;
}

function sortScenesForConstellationLayout(
  sceneList: ConstellationLayoutScene[],
): ConstellationLayoutScene[] {
  return [...sceneList].sort((a, b) => {
    if (a.is_title !== b.is_title) return a.is_title ? -1 : 1;
    if (a.is_end !== b.is_end) return a.is_end ? 1 : -1;
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.created_at ?? "").localeCompare(b.created_at ?? "");
  });
}

function orderScenesForConstellationLayout(
  sceneList: ConstellationLayoutScene[],
  graph: ConstellationLayoutGraph | undefined,
): ConstellationLayoutScene[] {
  if (!graph?.nodes?.length) return sortScenesForConstellationLayout(sceneList);

  const sceneById = new Map(sceneList.map((scene) => [scene.id, scene]));
  const ordered: ConstellationLayoutScene[] = [];
  const seen = new Set<string>();

  const sortedNodes = [...graph.nodes].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    if (a.x !== b.x) return a.x - b.x;
    return (a.index ?? 0) - (b.index ?? 0);
  });

  for (const node of sortedNodes) {
    const scene = sceneById.get(node.id);
    if (scene && !seen.has(scene.id)) {
      ordered.push(scene);
      seen.add(scene.id);
    }
  }

  for (const scene of sortScenesForConstellationLayout(sceneList)) {
    if (!seen.has(scene.id)) {
      ordered.push(scene);
      seen.add(scene.id);
    }
  }

  return ordered;
}

/**
 * Scene positions relative to the title star at the origin (constellation anchor).
 */
export function computeConstellationScenePositions(
  scenes: ConstellationLayoutScene[],
  graph: ConstellationLayoutGraph | undefined,
  anchor: Vec3 = [0, 0, 0],
): Map<string, Vec3> {
  const positions = new Map<string, Vec3>();
  const ordered = orderScenesForConstellationLayout(scenes, graph);
  const count = ordered.length;

  if (!graph?.nodes?.length) {
    ordered.forEach((scene, idx) => {
      const along = count === 1 ? 0 : idx * COSMOS_SCENE_LEVEL_SPACING;
      positions.set(scene.id, [anchor[0] + along, anchor[1], anchor[2]]);
    });
    return positions;
  }

  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const rootId = graph.meta?.root_id ?? graph.nodes[0]?.id;
  const rootNode = rootId ? nodeById.get(rootId) : graph.nodes[0];

  ordered.forEach((scene, idx) => {
    const node = nodeById.get(scene.id);
    if (node && rootNode) {
      const alongPath = node.level * COSMOS_SCENE_LEVEL_SPACING;
      const branchSpread = (node.x - rootNode.x) * COSMOS_SCENE_BRANCH_SPACING;
      positions.set(scene.id, [
        anchor[0] + alongPath,
        anchor[1],
        anchor[2] + branchSpread,
      ]);
      return;
    }
    const along = count === 1 ? 0 : idx * COSMOS_SCENE_LEVEL_SPACING;
    positions.set(scene.id, [anchor[0] + along, anchor[1], anchor[2]]);
  });

  return positions;
}

/** Bounding radius from the title anchor to the outermost scene plus visual padding. */
export function constellationFootprintRadius(
  localPositions: Map<string, Vec3>,
  padding: number = COSMOS_CONSTELLATION_VISUAL_PADDING,
): number {
  let maxReach = COSMOS_DEFAULT_FOOTPRINT_RADIUS;
  for (const [x, , z] of localPositions.values()) {
    maxReach = Math.max(maxReach, Math.hypot(x, z) + padding);
  }
  return maxReach;
}

function circlesSeparated(
  ax: number,
  az: number,
  aRadius: number,
  bx: number,
  bz: number,
  bRadius: number,
  minGap: number,
): boolean {
  return Math.hypot(ax - bx, az - bz) >= aRadius + bRadius + minGap;
}

function findConstellationAnchor(
  footprintRadius: number,
  placed: Array<{ x: number; z: number; radius: number }>,
  minGap: number,
): Vec3 {
  if (placed.length === 0) return [0, 0, 0];

  let angle = 0;
  let radius = 0;
  const angleStep = 0.62;
  const radiusGrowth = minGap * 0.75;

  for (let attempt = 0; attempt < 8000; attempt++) {
    angle += angleStep;
    radius += radiusGrowth / (2 * Math.PI);
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const ok = placed.every((other) =>
      circlesSeparated(cx, cz, footprintRadius, other.x, other.z, other.radius, minGap),
    );
    if (ok) return [cx, 0, cz];
  }

  const fallback = placed.length * (minGap + footprintRadius * 2);
  return [fallback, 0, 0];
}

/**
 * Place constellation anchors so each title star stays outside other
 * constellations, with at least `minGapScenes` scene spacings between bounds.
 */
export function distributeConstellationAnchors(
  items: ConstellationAnchorInput[],
  options: ConstellationAnchorOptions = {},
): Map<string, Vec3> {
  const minGapScenes = options.minGapScenes ?? COSMOS_CONSTELLATION_GAP_SCENES;
  const levelSpacing = options.levelSpacing ?? COSMOS_SCENE_LEVEL_SPACING;
  const minGap = minGapScenes * levelSpacing;

  const anchors = new Map<string, Vec3>();
  const placed: Array<{ x: number; z: number; radius: number }> = [];

  for (const item of items) {
    const [x, , z] = findConstellationAnchor(item.footprintRadius, placed, minGap);
    anchors.set(item.id, [x, 0, z]);
    placed.push({ x, z, radius: item.footprintRadius });
  }

  return anchors;
}
