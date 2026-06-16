import type { ReactNode } from "react";
import type { AtomVisualProps } from "../../index.js";
import { DraggableAtomGroup } from "../../DraggableAtomGroup.js";
import {
  mergeConstellationAppearance,
  type ConstellationAppearance,
} from "../appearance.js";
import { Star } from "./Star.js";
import { ConstellationEdge } from "./ConstellationEdge.js";
import {
  ConstellationTitle,
  computeConstellationBounds,
  type ConstellationStoryOverlay,
} from "./ConstellationTitle.js";
import { StarBillboard } from "./StarBillboard.js";
import { PublishedConstellationAura } from "./PublishedConstellationAura.js";
import type { Vec3 } from "./layout.js";

export interface ConstellationSceneEntry {
  id: string;
  /** Visual with final position already computed by the consumer. */
  visual: AtomVisualProps;
  /** Title scene — arc starts here. */
  isTitle?: boolean;
  /** End scene — arc ends here. */
  isEnd?: boolean;
  /** Scene label shown beneath the preview card. */
  label?: string;
  /** Static preview image (coverbox, poster frame, etc.). */
  previewImageUrl?: string | null;
  /** Custom preview when no image URL is available. */
  previewContent?: ReactNode;
  /** When true the star renders at reduced brightness/saturation. */
  dimmed?: boolean;
  /** When true the star is non-navigable (click suppressed). */
  locked?: boolean;
  /** Highlight this star's billboard (focused traversal). */
  focused?: boolean;
  /** Control strip slot — rendered beneath preview when focused. */
  controlsSlot?: ReactNode;
  /** Creator can drag this star to reshape the constellation. */
  draggable?: boolean;
}

export interface ConstellationEdgeEntry {
  source: string;
  target: string;
  type: "choice" | "go_to_scene" | "sequential";
}

export interface ConstellationProps {
  /** Scene entries with positions already computed by the consumer. */
  scenes: ConstellationSceneEntry[];
  /** Film title rendered as ghost typography across the group. */
  storyTitle?: string;
  /** Director credit, rating, and genre beneath the arched title. */
  storyOverlay?: ConstellationStoryOverlay;
  /** Explicit story-flow edges (goto + choice). No implicit sequential links. */
  edges?: ConstellationEdgeEntry[];
  appearance?: Partial<ConstellationAppearance>;
  /** When false, hide Html billboards and arc title (e.g. while editor is open). */
  showOverlays?: boolean;
  /** When false, hide the arched story title (e.g. unfocused constellations). */
  showStoryTitle?: boolean;
  /** When true and theme publishedEffect is enabled, stars/edges glow brighter. */
  published?: boolean;
  /** When true, all stars in this constellation use focusEffect pulse tokens. */
  storyFocused?: boolean;
  onSceneSelect?: (index: number) => void;
  /** Live position updates while dragging a scene star. */
  onScenePositionChange?: (sceneId: string, position: Vec3) => void;
  /** Fired when a drag gesture begins (after the pointer threshold). */
  onSceneDragStart?: (sceneId: string) => void;
  /** Fired when a drag gesture ends, before persistence. */
  onSceneDragEnd?: (sceneId: string) => void;
  /** Persisted when a drag gesture completes. */
  onScenePositionCommit?: (sceneId: string, position: Vec3) => void;
}

/**
 * A single story rendered as a constellation: scene-stars connected by
 * luminous gradient edges. This is the cosmos realm's `Group` component —
 * identical rendering for own and others' stories.
 */
export function Constellation({
  scenes,
  storyTitle,
  storyOverlay,
  edges = [],
  appearance: appearanceOverrides,
  showOverlays = true,
  showStoryTitle = true,
  published = false,
  storyFocused = false,
  onSceneSelect,
  onScenePositionChange,
  onSceneDragStart,
  onSceneDragEnd,
  onScenePositionCommit,
}: ConstellationProps) {
  const appearance = mergeConstellationAppearance(appearanceOverrides);
  const publishedActive = published && appearance.publishedEffect.enabled;
  const publishedBoost = publishedActive
    ? {
        saturationBoost: appearance.publishedEffect.starSaturationBoost,
        lightnessBoost: appearance.publishedEffect.starLightnessBoost,
      }
    : undefined;
  const edgeGlowMultiplier = publishedActive
    ? appearance.publishedEffect.edgeGlowMultiplier
    : 1;
  const focusEffect =
    storyFocused && appearance.focusEffect.enabled
      ? appearance.focusEffect
      : undefined;
  const sceneMap = new Map(scenes.map((s, i) => [s.id, { entry: s, index: i }]));
  const scenePositions = scenes.map((s) => s.visual.position);
  const bounds = computeConstellationBounds(scenePositions);

  const titleScene =
    scenes.find((s) => s.isTitle) ?? scenes[0];
  const lastScene = scenes[scenes.length - 1];

  const arcSpanPositions =
    scenePositions.length >= 2
      ? [...scenePositions].sort((a, b) => a[0] - b[0])
      : null;
  const arcFrom = arcSpanPositions?.[0] ?? titleScene?.visual.position;
  const arcTo =
    arcSpanPositions?.[arcSpanPositions.length - 1] ??
    lastScene?.visual.position;

  const resolvedEdges: {
    from: ConstellationSceneEntry;
    to: ConstellationSceneEntry;
    type: ConstellationEdgeEntry["type"];
  }[] = [];

  for (const edge of edges) {
    const src = sceneMap.get(edge.source);
    const tgt = sceneMap.get(edge.target);
    if (src && tgt) {
      resolvedEdges.push({ from: src.entry, to: tgt.entry, type: edge.type });
    }
  }

  return (
    <group>
      {publishedActive &&
      appearance.publishedEffect.dust.enabled &&
      bounds ? (
        <PublishedConstellationAura
          bounds={bounds}
          dust={appearance.publishedEffect.dust}
        />
      ) : null}

      {showOverlays && showStoryTitle && storyTitle && bounds ? (
        <ConstellationTitle
          title={storyTitle}
          bounds={bounds}
          appearance={appearance}
          arcFrom={arcFrom}
          arcTo={arcTo}
          storyOverlay={storyOverlay}
        />
      ) : null}

      {scenes.map((entry, i) => (
        <DraggableAtomGroup
          key={entry.id}
          position={entry.visual.position}
          enabled={!!entry.draggable && !!(onScenePositionChange || onScenePositionCommit)}
          onPositionChange={
            onScenePositionChange
              ? (pos) => onScenePositionChange(entry.id, pos)
              : undefined
          }
          onDragStart={
            onSceneDragStart ? () => onSceneDragStart(entry.id) : undefined
          }
          onDragEnd={
            onSceneDragEnd || onScenePositionCommit
              ? (pos) => {
                  onSceneDragEnd?.(entry.id);
                  onScenePositionCommit?.(entry.id, pos);
                }
              : undefined
          }
          onTap={
            onSceneSelect && !entry.locked
              ? () => onSceneSelect(i)
              : undefined
          }
        >
          <Star
            visual={{ ...entry.visual, position: [0, 0, 0] }}
            dimmed={entry.dimmed}
            locked={entry.locked}
            publishedBoost={publishedBoost}
            focused={storyFocused}
            focusEffect={focusEffect}
            onSelect={
              !entry.draggable && onSceneSelect && !entry.locked
                ? () => onSceneSelect(i)
                : undefined
            }
          />

          {showOverlays &&
          (entry.label || entry.previewImageUrl || entry.previewContent) ? (
            <StarBillboard
              label={entry.label ?? ""}
              appearance={appearance}
              previewImageUrl={entry.previewImageUrl}
              previewContent={entry.previewContent}
              dimmed={entry.dimmed}
              focused={entry.focused}
              controlsSlot={entry.controlsSlot}
              onPreviewClick={
                onSceneSelect && !entry.locked
                  ? () => onSceneSelect(i)
                  : undefined
              }
              visible={showOverlays}
            />
          ) : null}
        </DraggableAtomGroup>
      ))}

      {resolvedEdges.map(({ from, to, type }) => {
        const edgeDimmed = !!(from.dimmed || to.dimmed);
        return (
          <ConstellationEdge
            key={`edge-${from.id}-${to.id}-${type}`}
            from={from.visual.position}
            to={to.visual.position}
            hueA={from.visual.hue}
            hueB={to.visual.hue}
            intensityA={from.visual.intensity}
            intensityB={to.visual.intensity}
            dimmed={edgeDimmed}
            glowMultiplier={edgeGlowMultiplier}
          />
        );
      })}
    </group>
  );
}

