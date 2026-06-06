import { Text } from "@react-three/drei";
import type { ConstellationAppearance } from "../appearance.js";

export interface ConstellationBounds {
  center: [number, number, number];
  spanX: number;
  spanZ: number;
}

export function computeConstellationBounds(
  positions: [number, number, number][],
): ConstellationBounds | null {
  if (positions.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let sumY = 0;

  for (const [x, y, z] of positions) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    sumY += y;
  }

  return {
    center: [(minX + maxX) / 2, sumY / positions.length, (minZ + maxZ) / 2],
    spanX: Math.max(6, maxX - minX + 4),
    spanZ: Math.max(4, maxZ - minZ + 3),
  };
}

export interface ConstellationTitleProps {
  title: string;
  bounds: ConstellationBounds;
  appearance: ConstellationAppearance;
}

/**
 * Large ghostly film title draped across the constellation footprint.
 */
export function ConstellationTitle({
  title,
  bounds,
  appearance,
}: ConstellationTitleProps) {
  if (!title.trim()) return null;

  return (
    <Text
      position={[
        bounds.center[0],
        bounds.center[1] + appearance.titleYOffset,
        bounds.center[2],
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={appearance.titleFontSize}
      color={appearance.titleColor}
      fillOpacity={appearance.titleOpacity}
      anchorX="center"
      anchorY="middle"
      maxWidth={Math.max(bounds.spanX, bounds.spanZ) * 1.35}
      letterSpacing={appearance.titleLetterSpacing}
      textAlign="center"
    >
      {title.toUpperCase()}
    </Text>
  );
}
