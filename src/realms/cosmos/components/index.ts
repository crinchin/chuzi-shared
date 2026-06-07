export { World } from "./World.js";
export type { WorldProps } from "./World.js";

export { Star } from "./Star.js";
export type { StarProps } from "./Star.js";

export { Constellation } from "./Constellation.js";
export type {
  ConstellationProps,
  ConstellationSceneEntry,
  ConstellationEdgeEntry,
} from "./Constellation.js";

export { ConstellationEdge } from "./ConstellationEdge.js";
export type { ConstellationEdgeProps } from "./ConstellationEdge.js";

export { CosmosSandbox } from "./CosmosSandbox.js";
export type { CosmosSandboxProps } from "./CosmosSandbox.js";

export {
  distributeStars,
  distributeConstellationAnchors,
  computeConstellationScenePositions,
  constellationFootprintRadius,
  COSMOS_SCENE_LEVEL_SPACING,
  COSMOS_BRANCH_SIBLING_SPACING,
  COSMOS_SCENE_BRANCH_SPACING,
  COSMOS_CONSTELLATION_GAP_SCENES,
  COSMOS_DEFAULT_FOOTPRINT_RADIUS,
  COSMOS_CONSTELLATION_VISUAL_PADDING,
  COSMOS_MAX_SCENE_EDGE_LENGTH,
} from "./layout.js";
export type {
  Vec3,
  DistributeOptions,
  ConstellationLayoutScene,
  ConstellationLayoutEdge,
  ConstellationLayoutNode,
  ConstellationLayoutGraph,
  ConstellationAnchorInput,
  ConstellationAnchorOptions,
} from "./layout.js";

export { ConstellationTitle, computeConstellationBounds } from "./ConstellationTitle.js";
export type {
  ConstellationTitleProps,
  ConstellationBounds,
  ConstellationStoryOverlay,
} from "./ConstellationTitle.js";

export { StarBillboard } from "./StarBillboard.js";
export type { StarBillboardProps } from "./StarBillboard.js";

export {
  DEFAULT_CONSTELLATION_APPEARANCE,
  mergeConstellationAppearance,
} from "../appearance.js";
export type { ConstellationAppearance } from "../appearance.js";
