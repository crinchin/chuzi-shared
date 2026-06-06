import type { ReactNode } from "react";
import type { AtomVisualProps } from "../../index.js";
import {
  mergeConstellationAppearance,
  type ConstellationAppearance,
} from "../appearance.js";
import { Star } from "./Star.js";
import { ConstellationEdge } from "./ConstellationEdge.js";
import {
  ConstellationTitle,
  computeConstellationBounds,
} from "./ConstellationTitle.js";
import { StarBillboard } from "./StarBillboard.js";

export interface ConstellationSceneEntry {
  id: string;
  /** Visual with final position already computed by the consumer. */
  visual: AtomVisualProps;
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
  /** Explicit story-flow edges (goto + choice). No implicit sequential links. */
  edges?: ConstellationEdgeEntry[];
  appearance?: Partial<ConstellationAppearance>;
  onSceneSelect?: (index: number) => void;
}

/**
 * A single story rendered as a constellation: scene-stars connected by
 * luminous gradient edges. This is the cosmos realm's `Group` component —
 * identical rendering for own and others' stories.
 */
export function Constellation({
  scenes,
  storyTitle,
  edges = [],
  appearance: appearanceOverrides,
  onSceneSelect,
}: ConstellationProps) {
  const appearance = mergeConstellationAppearance(appearanceOverrides);
  const sceneMap = new Map(scenes.map((s, i) => [s.id, { entry: s, index: i }]));
  const bounds = computeConstellationBounds(
    scenes.map((s) => s.visual.position),
  );

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
      {storyTitle && bounds ? (
        <ConstellationTitle
          title={storyTitle}
          bounds={bounds}
          appearance={appearance}
        />
      ) : null}

      {scenes.map((entry, i) => (
        <group key={entry.id} position={entry.visual.position}>
          <Star
            visual={{ ...entry.visual, position: [0, 0, 0] }}
            dimmed={entry.dimmed}
            locked={entry.locked}
            onSelect={onSceneSelect ? () => onSceneSelect(i) : undefined}
          />

          {entry.label || entry.previewImageUrl || entry.previewContent ? (
            <StarBillboard
              label={entry.label ?? ""}
              appearance={appearance}
              previewImageUrl={entry.previewImageUrl}
              previewContent={entry.previewContent}
              dimmed={entry.dimmed}
              focused={entry.focused}
            />
          ) : null}
        </group>
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
          />
        );
      })}
    </group>
  );
}

