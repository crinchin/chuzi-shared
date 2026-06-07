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

/** World-space gap between parent and child along −Z (away from the viewer). */
export const COSMOS_SCENE_LEVEL_SPACING = 7;

/** Lateral gap between sibling branches at the same parent. */
export const COSMOS_BRANCH_SIBLING_SPACING = 5.5;

/** Minimum clearance between scene star centers in the XZ plane. */
export const COSMOS_MIN_NODE_CLEARANCE = 5;

/** Minimum clearance between unrelated edge segments in the XZ plane. */
export const COSMOS_MIN_EDGE_CLEARANCE = 2.2;

/** @deprecated API x multiplier — 3D layout uses parent-relative BFS instead. */
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

function buildChildrenByParent(
  edges: ConstellationLayoutEdge[],
): Map<string, string[]> {
  const childrenByParent = new Map<string, string[]>();

  for (const edge of edges) {
    const kids = childrenByParent.get(edge.source) ?? [];
    if (!kids.includes(edge.target)) {
      kids.push(edge.target);
    }
    childrenByParent.set(edge.source, kids);
  }

  return childrenByParent;
}

function sceneLevelJitter(sceneId: string): number {
  return (hashSceneId(sceneId, "y") - 0.5) * 1.2;
}

type Segment2D = { ax: number; az: number; bx: number; bz: number };

function distPointSegment2D(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  const cx = ax + t * dx;
  const cz = az + t * dz;
  return Math.hypot(px - cx, pz - cz);
}

function distSegmentSegment2D(a: Segment2D, b: Segment2D): number {
  if (
    (a.ax === a.bx && a.az === a.bz) ||
    (b.ax === b.bx && b.az === b.bz)
  ) {
    const pointSeg = a.ax === a.bx && a.az === a.bz ? b : a;
    const px = a.ax === a.bx && a.az === a.bz ? a.ax : b.ax;
    const pz = a.ax === a.bx && a.az === a.bz ? a.az : b.az;
    return distPointSegment2D(
      px,
      pz,
      pointSeg.ax,
      pointSeg.az,
      pointSeg.bx,
      pointSeg.bz,
    );
  }

  const checks = [
    distPointSegment2D(a.ax, a.az, b.ax, b.az, b.bx, b.bz),
    distPointSegment2D(a.bx, a.bz, b.ax, b.az, b.bx, b.bz),
    distPointSegment2D(b.ax, b.az, a.ax, a.az, a.bx, a.bz),
    distPointSegment2D(b.bx, b.bz, a.ax, a.az, a.bx, a.bz),
  ];
  return Math.min(...checks);
}

function collectEdgeSegments(
  positions: Map<string, Vec3>,
  edges: ConstellationLayoutEdge[],
  exclude?: { source: string; target: string },
): Segment2D[] {
  const segments: Segment2D[] = [];
  for (const edge of edges) {
    if (
      exclude &&
      edge.source === exclude.source &&
      edge.target === exclude.target
    ) {
      continue;
    }
    const src = positions.get(edge.source);
    const tgt = positions.get(edge.target);
    if (!src || !tgt) continue;
    segments.push({ ax: src[0], az: src[2], bx: tgt[0], bz: tgt[2] });
  }
  return segments;
}

function edgeClearanceOk(
  positions: Map<string, Vec3>,
  edges: ConstellationLayoutEdge[],
  sourceId: string,
  targetId: string,
  minClearance: number,
): boolean {
  const src = positions.get(sourceId);
  const tgt = positions.get(targetId);
  if (!src || !tgt) return true;

  const candidate: Segment2D = {
    ax: src[0],
    az: src[2],
    bx: tgt[0],
    bz: tgt[2],
  };
  const existing = collectEdgeSegments(positions, edges, {
    source: sourceId,
    target: targetId,
  });

  return existing.every(
    (seg) =>
      distSegmentSegment2D(candidate, seg) >= minClearance ||
      (seg.ax === candidate.ax &&
        seg.az === candidate.az &&
        seg.bx === candidate.bx &&
        seg.bz === candidate.bz),
  );
}

function nodeClearanceOk(
  positions: Map<string, Vec3>,
  sceneId: string,
  pos: Vec3,
  minClearance: number,
): boolean {
  for (const [otherId, otherPos] of positions) {
    if (otherId === sceneId) continue;
    if (Math.hypot(pos[0] - otherPos[0], pos[2] - otherPos[2]) < minClearance) {
      return false;
    }
  }
  return true;
}

function organicChildOffset(
  parentId: string,
  childId: string,
  childIndex: number,
  siblingCount: number,
  nodeCount: number,
): [number, number] {
  const fanSpread = Math.min(
    Math.PI * 0.9,
    0.28 * siblingCount + 0.22 * Math.sqrt(nodeCount),
  );
  const mid = (siblingCount - 1) / 2;
  const baseAngle =
    hashSceneId(parentId, "fan") * Math.PI * 2 +
    (childIndex - mid) * (fanSpread / Math.max(siblingCount - 1, 1));
  const reach =
    COSMOS_BRANCH_SIBLING_SPACING *
    (0.75 + hashSceneId(childId, "reach") * 0.65 + Math.min(nodeCount, 8) * 0.04);
  return [Math.cos(baseAngle) * reach, Math.sin(baseAngle) * reach * 0.18];
}

function placeChildScene(
  parentPos: Vec3,
  parentId: string,
  childId: string,
  childIndex: number,
  siblingCount: number,
  nodeCount: number,
): Vec3 {
  const depthStep =
    COSMOS_SCENE_LEVEL_SPACING *
    (0.82 + hashSceneId(childId, "depth") * 0.28);
  const [ox, oz] = organicChildOffset(
    parentId,
    childId,
    childIndex,
    siblingCount,
    nodeCount,
  );

  return [
    parentPos[0] + ox,
    parentPos[1] + sceneLevelJitter(childId),
    parentPos[2] - depthStep + oz,
  ];
}

function resolveNodeOverlaps(
  positions: Map<string, Vec3>,
  minClearance: number,
): void {
  const ids = [...positions.keys()];
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const aId = ids[i];
        const bId = ids[j];
        const a = positions.get(aId)!;
        const b = positions.get(bId)!;
        const dx = b[0] - a[0];
        const dz = b[2] - a[2];
        const dist = Math.hypot(dx, dz);
        if (dist >= minClearance || dist === 0) continue;

        const push = (minClearance - dist) * 0.55;
        const nx = dx / (dist || 1);
        const nz = dz / (dist || 1);
        positions.set(aId, [a[0] - nx * push, a[1], a[2] - nz * push]);
        positions.set(bId, [b[0] + nx * push, b[1], b[2] + nz * push]);
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function resolveEdgeOverlaps(
  positions: Map<string, Vec3>,
  edges: ConstellationLayoutEdge[],
  minClearance: number,
): void {
  for (let pass = 0; pass < 4; pass++) {
    let adjusted = false;
    for (const edge of edges) {
      const src = positions.get(edge.source);
      const tgt = positions.get(edge.target);
      if (!src || !tgt) continue;

      const candidate: Segment2D = {
        ax: src[0],
        az: src[2],
        bx: tgt[0],
        bz: tgt[2],
      };
      const others = collectEdgeSegments(positions, edges, edge);

      for (const other of others) {
        if (distSegmentSegment2D(candidate, other) >= minClearance) continue;

        const nudge =
          (hashSceneId(edge.target, `edge-${pass}`) - 0.5) *
          COSMOS_BRANCH_SIBLING_SPACING *
          0.35;
        positions.set(edge.target, [
          tgt[0] + nudge,
          tgt[1],
          tgt[2] - minClearance * 0.15,
        ]);
        adjusted = true;
        break;
      }
    }
    if (!adjusted) break;
  }
}

function placeEndScenes(
  ordered: ConstellationLayoutScene[],
  positions: Map<string, Vec3>,
  anchor: Vec3,
): void {
  let deepestZ = anchor[2];
  for (const pos of positions.values()) {
    deepestZ = Math.min(deepestZ, pos[2]);
  }

  const endScenes = ordered.filter((scene) => scene.is_end);
  endScenes.forEach((scene, idx) => {
    const endAngle =
      hashSceneId(scene.id, "end") * Math.PI * 2 +
      idx * GOLDEN_ANGLE * 0.35;
    const endSpread =
      COSMOS_BRANCH_SIBLING_SPACING *
      (1.4 + hashSceneId(scene.id, "end-r") * 0.8);
    positions.set(scene.id, [
      anchor[0] + Math.cos(endAngle) * endSpread,
      anchor[1] + sceneLevelJitter(scene.id),
      deepestZ - COSMOS_SCENE_LEVEL_SPACING,
    ]);
  });
}

function layoutFromGraphEdges(
  ordered: ConstellationLayoutScene[],
  edges: ConstellationLayoutEdge[],
  root: ConstellationLayoutScene,
  anchor: Vec3,
): Map<string, Vec3> {
  const positions = new Map<string, Vec3>();
  const sceneById = new Map(ordered.map((scene) => [scene.id, scene]));
  const orderIndex = new Map(ordered.map((scene, idx) => [scene.id, idx]));
  const nodeCount = ordered.length;

  positions.set(root.id, [anchor[0], anchor[1], anchor[2]]);

  const childrenByParent = buildChildrenByParent(edges);
  for (const kids of childrenByParent.values()) {
    kids.sort(
      (a, b) => (orderIndex.get(a) ?? 0) - (orderIndex.get(b) ?? 0),
    );
  }

  const visited = new Set<string>([root.id]);
  const queue = [root.id];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const parentPos = positions.get(parentId);
    if (!parentPos) continue;

    const kids = (childrenByParent.get(parentId) ?? []).filter(
      (childId) => sceneById.has(childId) && !sceneById.get(childId)?.is_end,
    );

    kids.forEach((childId, idx) => {
      if (visited.has(childId)) return;

      let candidate = placeChildScene(
        parentPos,
        parentId,
        childId,
        idx,
        kids.length,
        nodeCount,
      );

      for (let attempt = 0; attempt < 10; attempt++) {
        const attemptAngle =
          hashSceneId(childId, `try-${attempt}`) * Math.PI * 2;
        if (attempt > 0) {
          const reach = COSMOS_BRANCH_SIBLING_SPACING * (0.6 + attempt * 0.12);
          candidate = [
            parentPos[0] + Math.cos(attemptAngle) * reach,
            parentPos[1] + sceneLevelJitter(childId),
            parentPos[2] -
              COSMOS_SCENE_LEVEL_SPACING *
                (0.85 + hashSceneId(childId, `d-${attempt}`) * 0.25),
          ];
        }

        const trial = new Map(positions);
        trial.set(childId, candidate);
        if (
          nodeClearanceOk(positions, childId, candidate, COSMOS_MIN_NODE_CLEARANCE) &&
          edgeClearanceOk(
            trial,
            edges,
            parentId,
            childId,
            COSMOS_MIN_EDGE_CLEARANCE,
          )
        ) {
          break;
        }
      }

      positions.set(childId, candidate);
      visited.add(childId);
      queue.push(childId);
    });
  }

  placeEndScenes(ordered, positions, anchor);

  let spineLevel = 0;
  for (const scene of ordered) {
    if (positions.has(scene.id)) continue;
    spineLevel += 1;
    const angle = spineLevel * GOLDEN_ANGLE + hashSceneId(scene.id) * 0.55;
    const reach =
      COSMOS_BRANCH_SIBLING_SPACING *
      (0.8 + hashSceneId(scene.id, "spine") * 0.7);
    positions.set(scene.id, [
      anchor[0] + Math.cos(angle) * reach,
      anchor[1] + sceneLevelJitter(scene.id),
      anchor[2] - spineLevel * COSMOS_SCENE_LEVEL_SPACING,
    ]);
  }

  resolveNodeOverlaps(positions, COSMOS_MIN_NODE_CLEARANCE);
  resolveEdgeOverlaps(positions, edges, COSMOS_MIN_EDGE_CLEARANCE);

  return positions;
}

/**
 * Scene positions relative to the title star at the constellation anchor.
 * The title sits closest to the viewer (+Z); the story recedes along −Z with
 * organic lateral spread. Without edges, scenes use a golden-angle spine.
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

  const edges = graph?.edges ?? [];
  if (edges.length > 0) {
    return layoutFromGraphEdges(ordered, edges, root, anchor);
  }

  positions.set(root.id, [anchor[0], anchor[1], anchor[2]]);
  const nodeCount = ordered.length;

  let spineIndex = 0;
  for (const scene of ordered) {
    if (scene.id === root.id) continue;
    if (scene.is_end) continue;

    const angle = spineIndex * GOLDEN_ANGLE + hashSceneId(scene.id) * 0.55;
    const reach =
      COSMOS_BRANCH_SIBLING_SPACING *
      (0.85 + hashSceneId(scene.id, "d") * 0.75 + Math.min(nodeCount, 8) * 0.05);
    const depthStep =
      COSMOS_SCENE_LEVEL_SPACING *
      (0.85 + hashSceneId(scene.id, "depth") * 0.25);

    positions.set(scene.id, [
      anchor[0] + Math.cos(angle) * reach,
      anchor[1] + sceneLevelJitter(scene.id),
      anchor[2] - (spineIndex + 1) * depthStep,
    ]);
    spineIndex += 1;
  }

  placeEndScenes(ordered, positions, anchor);

  for (let i = 1; i < ordered.length; i++) {
    clampEdgeLength(
      positions,
      ordered[i - 1].id,
      ordered[i].id,
      COSMOS_MAX_SCENE_EDGE_LENGTH,
    );
  }

  resolveNodeOverlaps(positions, COSMOS_MIN_NODE_CLEARANCE);

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
