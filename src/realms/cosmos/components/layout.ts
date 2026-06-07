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

/** World-space gap between adjacent tree levels along +Z (chronological depth). */
export const COSMOS_SCENE_LEVEL_SPACING = 11;

/** Branch spread multiplier for tree_graph x offsets. */
export const COSMOS_SCENE_BRANCH_SPACING = 1.6;

/** Maximum distance between two connected scene stars (fallback spine only). */
export const COSMOS_MAX_SCENE_EDGE_LENGTH = 14;

/** Minimum empty space between constellation bounds, in scene spacings. */
export const COSMOS_CONSTELLATION_GAP_SCENES = 2;

/** Halo around a lone title star before scenes load. */
export const COSMOS_DEFAULT_FOOTPRINT_RADIUS = 10;

/** Extra world units around the outermost scene for billboards / focus glow. */
export const COSMOS_CONSTELLATION_VISUAL_PADDING = 6;

const GOLDEN_ANGLE = 2.399963229728653;

export interface ConstellationLayoutScene {
  id: string;
  is_title?: boolean;
  is_end?: boolean;
  order?: number;
  created_at?: string;
}

export interface ConstellationLayoutEdge {
  source: string;
  target: string;
}

export interface ConstellationLayoutNode {
  id: string;
  level: number;
  x: number;
  index?: number;
}

export interface ConstellationLayoutGraph {
  nodes: ConstellationLayoutNode[];
  edges?: ConstellationLayoutEdge[];
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

function hashSceneId(id: string, salt = ""): number {
  let h = 0;
  const key = id + salt;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h / 4294967296;
}

function clampEdgeLength(
  positions: Map<string, Vec3>,
  sourceId: string,
  targetId: string,
  maxLength: number,
): void {
  const src = positions.get(sourceId);
  const tgt = positions.get(targetId);
  if (!src || !tgt) return;

  const dx = tgt[0] - src[0];
  const dy = tgt[1] - src[1];
  const dz = tgt[2] - src[2];
  const len = Math.hypot(dx, dy, dz);
  if (len <= maxLength || len === 0) return;

  const scale = maxLength / len;
  positions.set(targetId, [
    src[0] + dx * scale,
    src[1] + dy * scale,
    src[2] + dz * scale,
  ]);
}

function buildParentByChild(
  ordered: ConstellationLayoutScene[],
  edges: ConstellationLayoutEdge[],
): Map<string, string> {
  const parentByChild = new Map<string, string>();
  const orderIndex = new Map(ordered.map((scene, idx) => [scene.id, idx]));

  const sortedEdges = [...edges].sort((a, b) => {
    const aIdx = orderIndex.get(a.target) ?? Number.MAX_SAFE_INTEGER;
    const bIdx = orderIndex.get(b.target) ?? Number.MAX_SAFE_INTEGER;
    return aIdx - bIdx;
  });

  for (const edge of sortedEdges) {
    if (!parentByChild.has(edge.target)) {
      parentByChild.set(edge.target, edge.source);
    }
  }

  return parentByChild;
}

function sceneLevelJitter(sceneId: string): number {
  return (hashSceneId(sceneId, "y") - 0.5) * 1.2;
}

/**
 * Scene positions relative to the title star at the constellation anchor.
 * When a tree_graph is present, level maps to +Z depth (chronological "after")
 * and x spreads branches laterally. Without a graph, scenes fall back to a
 * linear spine along +Z.
 */
export function computeConstellationScenePositions(
  scenes: ConstellationLayoutScene[],
  graph: ConstellationLayoutGraph | undefined,
  anchor: Vec3 = [0, 0, 0],
): Map<string, Vec3> {
  const positions = new Map<string, Vec3>();
  const ordered = orderScenesForConstellationLayout(scenes, graph);
  if (ordered.length === 0) return positions;

  const root =
    ordered.find((scene) => scene.is_title) ??
    ordered[0];
  positions.set(root.id, [anchor[0], anchor[1], anchor[2]]);

  const nodeById = new Map(
    (graph?.nodes ?? []).map((node) => [node.id, node]),
  );

  if (nodeById.size > 0) {
    const rootNode = nodeById.get(root.id);
    const rootX = rootNode?.x ?? 0;

    for (const scene of ordered) {
      if (scene.id === root.id) continue;
      const node = nodeById.get(scene.id);
      if (!node) continue;

      positions.set(scene.id, [
        anchor[0] + (node.x - rootX) * COSMOS_SCENE_BRANCH_SPACING,
        anchor[1] + sceneLevelJitter(scene.id),
        anchor[2] + node.level * COSMOS_SCENE_LEVEL_SPACING,
      ]);
    }

    let fallbackLevel = 0;
    for (const scene of ordered) {
      if (positions.has(scene.id)) continue;
      fallbackLevel += 1;
      positions.set(scene.id, [
        anchor[0],
        anchor[1] + sceneLevelJitter(scene.id),
        anchor[2] + fallbackLevel * COSMOS_SCENE_LEVEL_SPACING,
      ]);
    }

    return positions;
  }

  const edges = graph?.edges ?? [];
  const parentByChild = edges.length > 0
    ? buildParentByChild(ordered, edges)
    : new Map<string, string>();

  let spineIndex = 0;
  for (const scene of ordered) {
    if (scene.id === root.id) continue;

    let parentId = parentByChild.get(scene.id);
    if (!parentId || !positions.has(parentId)) {
      const prevScene = ordered[spineIndex] ?? root;
      parentId = prevScene.id;
    }

    const parentPos = positions.get(parentId) ?? [anchor[0], anchor[1], anchor[2]];
    const angle = spineIndex * GOLDEN_ANGLE + hashSceneId(scene.id) * 0.55;
    const dist =
      COSMOS_MAX_SCENE_EDGE_LENGTH * (0.9 + hashSceneId(scene.id, "d") * 0.1);
    const yJitter = sceneLevelJitter(scene.id);

    positions.set(scene.id, [
      parentPos[0] + Math.cos(angle) * dist,
      parentPos[1] + yJitter,
      parentPos[2] + Math.sin(angle) * dist,
    ]);
    spineIndex += 1;
  }

  if (edges.length > 0) {
    for (const edge of edges) {
      clampEdgeLength(
        positions,
        edge.source,
        edge.target,
        COSMOS_MAX_SCENE_EDGE_LENGTH,
      );
    }
  } else {
    for (let i = 1; i < ordered.length; i++) {
      clampEdgeLength(
        positions,
        ordered[i - 1].id,
        ordered[i].id,
        COSMOS_MAX_SCENE_EDGE_LENGTH,
      );
    }
  }

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
