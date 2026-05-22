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

export interface ConstellationProps {
  /** Scene entries in order (title first, end last), already positioned. */
  scenes: ConstellationSceneEntry[];
  onSceneSelect?: (index: number) => void;
}

/**
 * A single story rendered as a constellation: scene-stars connected by
 * luminous gradient edges. This is the cosmos realm's `Group` component —
 * identical rendering for own and others' stories.
 *
 * The consumer provides scenes with positions already computed so that
 * overlay logic (camera targeting, focus rings) can use the same positions.
 */
export function Constellation({
  scenes,
  onSceneSelect,
}: ConstellationProps) {
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

      {scenes.map((entry, i) => {
        if (i === 0) return null;
        const prev = scenes[i - 1];
        const edgeDimmed = !!(entry.dimmed || prev.dimmed);
        return (
          <ConstellationEdge
            key={`edge-${prev.id}-${entry.id}`}
            from={prev.visual.position}
            to={entry.visual.position}
            hueA={prev.visual.hue}
            hueB={entry.visual.hue}
            intensityA={prev.visual.intensity}
            intensityB={entry.visual.intensity}
            dimmed={edgeDimmed}
          />
        );
      })}
    </group>
  );
}
