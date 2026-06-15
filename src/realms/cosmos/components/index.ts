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
  distributeClusteredConstellationAnchors,
  computeConstellationScenePositions,
  constellationFootprintRadius,
  COSMOS_SCENE_LEVEL_SPACING,
  COSMOS_BRANCH_SIBLING_SPACING,
  COSMOS_MIN_NODE_CLEARANCE,
  COSMOS_MIN_EDGE_CLEARANCE,
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
  ClusteredAnchorInput,
  ClusterAnchorResult,
} from "./layout.js";

export { ConstellationTitle, ConstellationStoryTitleInline, computeConstellationBounds } from "./ConstellationTitle.js";
export type {
  ConstellationTitleProps,
  ConstellationStoryTitleInlineProps,
  ConstellationBounds,
  ConstellationStoryOverlay,
} from "./ConstellationTitle.js";

export { StarBillboard } from "./StarBillboard.js";
export type { StarBillboardProps } from "./StarBillboard.js";

export {
  DEFAULT_CONSTELLATION_APPEARANCE,
  mergeConstellationAppearance,
} from "../appearance.js";
export type {
  ConstellationAppearance,
  PublishedEffectAppearance,
  PublishedDustAppearance,
} from "../appearance.js";

export { PublishedConstellationAura } from "./PublishedConstellationAura.js";
export type { PublishedConstellationAuraProps } from "./PublishedConstellationAura.js";

export { ClusterNebula } from "./ClusterNebula.js";
export type { ClusterNebulaProps } from "./ClusterNebula.js";

export { ClusterLabel } from "./ClusterLabel.js";
export type { ClusterLabelProps } from "./ClusterLabel.js";
