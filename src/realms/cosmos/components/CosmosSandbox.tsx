import { useMemo } from "react";
import type { StoryListItem } from "../../../types/index.js";
import { cosmosMapping } from "../index.js";
import { Star } from "./Star.js";
import { World } from "./World.js";
import { distributeStars, type Vec3 } from "./layout.js";

export interface CosmosSandboxProps {
  films: StoryListItem[];
  onFilmSelect?: (film: StoryListItem) => void;
  /** Layout seed — same seed + same films = same layout. */
  seed?: number;
}

/**
 * Drop-in 3D sandbox. Hands a list of films, gets back a navigable
 * starfield where each star is a film. Useful for: integration tests, the
 * realm-picker preview thumbnail, the editor's "preview as star" mode, and
 * as the smoke-test entry while migrating chuzi-web off Laravel.
 */
export function CosmosSandbox({
  films,
  onFilmSelect,
  seed = 1,
}: CosmosSandboxProps) {
  const placed = useMemo(() => {
    const positions: Vec3[] = distributeStars(films.length, { seed });
    return films.map((film, i) => ({
      film,
      visual: { ...cosmosMapping(film), position: positions[i] },
    }));
  }, [films, seed]);

  return (
    <World>
      {placed.map(({ film, visual }) => (
        <Star
          key={film.id}
          visual={visual}
          onSelect={onFilmSelect ? () => onFilmSelect(film) : undefined}
        />
      ))}
    </World>
  );
}
