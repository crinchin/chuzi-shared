import type { AtomVisualProps } from "../../index.js";
import { Star } from "./Star.js";
import { ConstellationEdge } from "./ConstellationEdge.js";

export interface ConstellationSceneEntry {
  id: string;
  /** Visual with final position already computed by the consumer. */
  visual: AtomVisualProps;
  /** When true the star renders at reduced brightness/saturation. */
  dimmed?: boolean;
  /** When true the star is non-navigable (click suppressed). */
  locked?: boolean;
}

export interface ConstellationEdgeEntry {
  source: string;
  target: string;
  type: "choice" | "go_to_scene" | "sequential";
}

export interface ConstellationProps {
  /** Scene entries in order (title first, end last), already positioned. */
  scenes: ConstellationSceneEntry[];
  /** Optional explicit edges. When provided, replaces sequential rendering. */
  edges?: ConstellationEdgeEntry[];
  onSceneSelect?: (index: number) => void;
}

/**
 * A single story rendered as a constellation: scene-stars connected by
 * luminous gradient edges. This is the cosmos realm's `Group` component —
 * identical rendering for own and others' stories.
 *
 * The consumer provides scenes with positions already computed so that
 * overlay logic (camera targeting, focus rings) can use the same positions.
 *
 * When `edges` is provided, the component renders from the explicit graph
 * (supporting Y-forks for choices) instead of sequential order.
 */
export function Constellation({
  scenes,
  edges,
  onSceneSelect,
}: ConstellationProps) {
  const sceneMap = new Map(scenes.map((s, i) => [s.id, { entry: s, index: i }]));

  const resolvedEdges: {
    from: ConstellationSceneEntry;
    to: ConstellationSceneEntry;
    type: ConstellationEdgeEntry["type"];
  }[] = [];

  if (edges && edges.length > 0) {
    for (const edge of edges) {
      const src = sceneMap.get(edge.source);
      const tgt = sceneMap.get(edge.target);
      if (src && tgt) {
        resolvedEdges.push({ from: src.entry, to: tgt.entry, type: edge.type });
      }
    }
  } else {
    for (let i = 1; i < scenes.length; i++) {
      resolvedEdges.push({
        from: scenes[i - 1],
        to: scenes[i],
        type: "sequential",
      });
    }
  }

  return (
    <group>
      {scenes.map((entry, i) => (
        <Star
          key={entry.id}
          visual={entry.visual}
          dimmed={entry.dimmed}
          locked={entry.locked}
          onSelect={onSceneSelect ? () => onSceneSelect(i) : undefined}
        />
      ))}

      {resolvedEdges.map(({ from, to, type }) => {
        const edgeDimmed = !!(from.dimmed || to.dimmed);
        const variant = type === "go_to_scene" ? "dotted" : "solid";
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
            variant={variant}
          />
        );
      })}
    </group>
  );
}
