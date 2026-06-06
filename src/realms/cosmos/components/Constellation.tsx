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
  /** Scene entries with positions already computed by the consumer. */
  scenes: ConstellationSceneEntry[];
  /** Explicit story-flow edges (goto + choice). No implicit sequential links. */
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
 * Only renders edges from the explicit graph (goto + choice links).
 */
export function Constellation({
  scenes,
  edges = [],
  onSceneSelect,
}: ConstellationProps) {
  const sceneMap = new Map(scenes.map((s, i) => [s.id, { entry: s, index: i }]));

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
