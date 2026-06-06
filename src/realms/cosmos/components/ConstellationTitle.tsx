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
  /** World position of the title (first) scene — arc starts here. */
  arcFrom?: [number, number, number];
  /** World position of the end scene — arc ends here. */
  arcTo?: [number, number, number];
}

const WORLD_TO_SVG = 58;

/**
 * Vintage cartography-style ocean label arcing from title scene to end scene.
 */
export function ConstellationTitle({
  title,
  bounds,
  appearance,
  arcFrom,
  arcTo,
}: ConstellationTitleProps) {
  const gradientId = useId().replace(/:/g, "");
  const pathId = `arc-${gradientId}`;

  if (!title.trim()) return null;

  const span = Math.max(bounds.spanX, bounds.spanZ);
  const svgWidth = Math.max(420, Math.round(span * WORLD_TO_SVG + 80));
  const svgHeight = 110;

  const centerX = svgWidth / 2;
  const arcY = svgHeight * 0.88;
  const arcPeak = svgHeight * 0.06;

  let arcStartX = svgWidth * 0.04;
  let arcEndX = svgWidth * 0.96;

  if (arcFrom && arcTo) {
    const [fromX] = arcFrom;
    const [toX] = arcTo;
    arcStartX = centerX + (fromX - bounds.center[0]) * WORLD_TO_SVG;
    arcEndX = centerX + (toX - bounds.center[0]) * WORLD_TO_SVG;
    arcStartX = Math.max(12, Math.min(arcStartX, svgWidth - 12));
    arcEndX = Math.max(12, Math.min(arcEndX, svgWidth - 12));
    if (arcStartX > arcEndX) {
      const swap = arcStartX;
      arcStartX = arcEndX;
      arcEndX = swap;
    }
  }

  const arcMidX = (arcStartX + arcEndX) / 2;
  const arcPath = `M ${arcStartX} ${arcY} Q ${arcMidX} ${arcPeak} ${arcEndX} ${arcY}`;

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
              <stop offset="0%" stopColor="#8ab4c8" />
              <stop offset="35%" stopColor="#c8d8e4" />
              <stop offset="65%" stopColor="#e8dcc8" />
              <stop offset="100%" stopColor="#8ab4c8" />
            </linearGradient>
            <path id={pathId} d={arcPath} fill="none" />
          </defs>
          <text
            fill={`url(#${gradientId})`}
            fontFamily="'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
            fontSize={appearance.titleFontSize}
            fontWeight={700}
            fontStyle="italic"
            letterSpacing={appearance.titleLetterSpacing}
            opacity={appearance.titleOpacity}
            stroke="rgba(20,40,60,0.35)"
            strokeWidth={0.6}
            paintOrder="stroke fill"
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
