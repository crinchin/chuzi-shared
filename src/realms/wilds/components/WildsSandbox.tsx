import { useMemo } from "react";
import type { StoryListItem } from "../../../types/index.js";
import { wildsMapping } from "../index.js";
import { Tree } from "./Tree.js";
import { WildsWorld } from "./WildsWorld.js";
import { distributeForest, type Vec3 } from "./layout.js";

export interface WildsSandboxProps {
  films: StoryListItem[];
  onFilmSelect?: (film: StoryListItem) => void;
  /** Layout seed — same seed + same films = same forest. */
  seed?: number;
}

/**
 * Drop-in 3D wilds sandbox: hand a list of films, get back a navigable
 * forest where each film is a tree. Trees are clustered into clumps
 * (groves) rather than uniformly distributed — mirrors how real forests
 * grow, and reads better visually than a tree grid. Mirrors `CosmosSandbox`.
 */
export function WildsSandbox({
  films,
  onFilmSelect,
  seed = 1,
}: WildsSandboxProps) {
  const placed = useMemo(() => {
    const positions: Vec3[] = distributeForest(films.length, { seed });
    return films.map((film, i) => ({
      film,
      visual: { ...wildsMapping(film), position: positions[i] },
    }));
  }, [films, seed]);

  return (
    <WildsWorld>
      {placed.map(({ film, visual }) => (
        <Tree
          key={film.id}
          visual={visual}
          onSelect={onFilmSelect ? () => onFilmSelect(film) : undefined}
        />
      ))}
    </WildsWorld>
  );
}
