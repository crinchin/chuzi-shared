import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import * as THREE from "three";

export type ConstellationEdgeVariant = "solid" | "dotted";

export interface ConstellationEdgeProps {
  from: [number, number, number];
  to: [number, number, number];
  hueA: number;
  hueB: number;
  /** Inward gap so the line doesn't touch the star spheres. */
  gap?: number;
  intensityA?: number;
  intensityB?: number;
  /** Reduce opacity to indicate an unwatched connection. */
  dimmed?: boolean;
  /** Solid for player choices; dotted + animated for default goto paths. */
  variant?: ConstellationEdgeVariant;
}

function AnimatedDashedLine({
  points,
  vertexColors,
  lineWidth,
  opacity,
}: {
  points: [THREE.Vector3, THREE.Vector3];
  vertexColors: [THREE.Color, THREE.Color];
  lineWidth: number;
  opacity: number;
}) {
  const lineRef = useRef<Line2>(null);

  useFrame((_, delta) => {
    const material = lineRef.current?.material as THREE.Material & {
      dashOffset?: number;
      dashed?: boolean;
    } | undefined;
    if (material?.dashed && material.dashOffset != null) {
      material.dashOffset -= delta * 2.5;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      vertexColors={vertexColors}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      toneMapped={false}
      dashed
      dashSize={0.35}
      gapSize={0.3}
    />
  );
}

/**
 * A luminous line connecting two stars in a constellation. Endpoints are
 * pulled inward so the line floats between the stars rather than touching
 * them. Color interpolates from hueA to hueB via vertex colors.
 *
 * Goto paths render as animated dotted lines; choice paths render solid.
 */
export function ConstellationEdge({
  from,
  to,
  hueA,
  hueB,
  gap = 0.55,
  intensityA = 0.5,
  intensityB = 0.5,
  dimmed,
  variant = "solid",
}: ConstellationEdgeProps) {
  const { points, colorA, colorB, glowA, glowB } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();

    if (len < gap * 2.5) {
      return { points: null, colorA: null, colorB: null, glowA: null, glowB: null };
    }

    dir.normalize();
    const start = a.clone().add(dir.clone().multiplyScalar(gap));
    const end = b.clone().sub(dir.clone().multiplyScalar(gap));

    const lA = 55 + intensityA * 20;
    const lB = 55 + intensityB * 20;

    const cA = new THREE.Color(`hsl(${hueA}, 70%, ${lA}%)`);
    const cB = new THREE.Color(`hsl(${hueB}, 70%, ${lB}%)`);

    const gA = new THREE.Color(`hsl(${hueA}, 50%, ${lA + 10}%)`);
    const gB = new THREE.Color(`hsl(${hueB}, 50%, ${lB + 10}%)`);

    return {
      points: [start, end] as [THREE.Vector3, THREE.Vector3],
      colorA: cA,
      colorB: cB,
      glowA: gA,
      glowB: gB,
    };
  }, [from, to, hueA, hueB, gap, intensityA, intensityB]);

  if (!points || !colorA || !colorB || !glowA || !glowB) return null;

  const isDotted = variant === "dotted";
  const glowOpacity = dimmed ? 0.04 : isDotted ? 0.08 : 0.12;
  const coreOpacity = dimmed ? 0.15 : isDotted ? 0.45 : 0.6;

  if (isDotted) {
    return (
      <group>
        <AnimatedDashedLine
          points={points}
          vertexColors={[glowA, glowB]}
          lineWidth={4}
          opacity={glowOpacity}
        />
        <AnimatedDashedLine
          points={points}
          vertexColors={[colorA, colorB]}
          lineWidth={1.5}
          opacity={coreOpacity}
        />
      </group>
    );
  }

  return (
    <group>
      <Line
        points={points}
        vertexColors={[glowA, glowB]}
        lineWidth={4}
        transparent
        opacity={glowOpacity}
        toneMapped={false}
      />
      <Line
        points={points}
        vertexColors={[colorA, colorB]}
        lineWidth={1.5}
        transparent
        opacity={coreOpacity}
        toneMapped={false}
      />
    </group>
  );
}
