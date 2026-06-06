import { useId } from "react";
import { Billboard, Html } from "@react-three/drei";
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
 * Rainbow arc title floating above the constellation — always readable,
 * never occluding the stars beneath.
 */
export function ConstellationTitle({
  title,
  bounds,
  appearance,
}: ConstellationTitleProps) {
  const gradientId = useId().replace(/:/g, "");
  const pathId = `arc-${gradientId}`;

  if (!title.trim()) return null;

  const span = Math.max(bounds.spanX, bounds.spanZ);
  const svgWidth = Math.max(360, Math.round(span * 52));
  const svgHeight = 80;
  const arcPath = `M ${svgWidth * 0.04} ${svgHeight * 0.82} Q ${svgWidth * 0.5} ${svgHeight * 0.08} ${svgWidth * 0.96} ${svgHeight * 0.82}`;

  return (
    <Billboard
      position={[
        bounds.center[0],
        bounds.center[1] + appearance.titleYOffset,
        bounds.center[2],
      ]}
    >
      <Html
        center
        transform
        distanceFactor={appearance.titleDistanceFactor}
        zIndexRange={appearance.htmlZIndexRange}
        occlude={false}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ overflow: "visible", display: "block" }}
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7eb8ff" />
              <stop offset="30%" stopColor="#b8a0ff" />
              <stop offset="55%" stopColor="#ffb8e8" />
              <stop offset="78%" stopColor="#ffd47e" />
              <stop offset="100%" stopColor="#7eb8ff" />
            </linearGradient>
            <path id={pathId} d={arcPath} fill="none" />
          </defs>
          <text
            fill={`url(#${gradientId})`}
            fontSize={appearance.titleFontSize}
            fontWeight={800}
            letterSpacing={appearance.titleLetterSpacing}
            opacity={appearance.titleOpacity}
          >
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {title.toUpperCase()}
            </textPath>
          </text>
        </svg>
      </Html>
    </Billboard>
  );
}
