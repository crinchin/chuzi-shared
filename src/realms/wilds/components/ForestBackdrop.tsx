import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { InstancedMesh } from "three";
import { Object3D } from "three";

export interface ForestBackdropProps {
  /** Number of ambient backdrop trees. Default 320. */
  count?: number;
  /** Inner radius — backdrop starts beyond this. */
  innerRadius?: number;
  /** Outer radius — backdrop fades out by here. */
  outerRadius?: number;
  /** Deterministic seed; identical seeds produce identical forests. */
  seed?: number;
}

/**
 * Ambient surrounding forest. Non-interactive, low-poly tree silhouettes
 * scattered in a ring around the film-tree region to give the world depth
 * and read as "you are inside a forest." Mirrors the role of drei's
 * <Stars> in cosmos/World — pure backdrop, distinct from the
 * metadata-bearing film atoms.
 *
 * Two instanced meshes (trunk cylinder + canopy cone) keep the draw cost
 * to two calls regardless of count. Y is always 0 — backdrop trees stand
 * on the same ground plane as the film trees and fade into the world fog.
 */
export function ForestBackdrop({
  count = 320,
  innerRadius = 36,
  outerRadius = 78,
  seed = 7,
}: ForestBackdropProps) {
  const trunkRef = useRef<InstancedMesh>(null);
  const canopyRef = useRef<InstancedMesh>(null);

  const placements = useMemo(
    () => buildPlacements(count, innerRadius, outerRadius, seed),
    [count, innerRadius, outerRadius, seed],
  );

  // One-shot transform write on mount + whenever placements change.
  // No per-frame work — the backdrop is static.
  useFrame(() => {
    if (!trunkRef.current || !canopyRef.current) return;
    if (trunkRef.current.userData.placed) return;
    const dummy = new Object3D();
    placements.forEach((p, i) => {
      const trunkH = p.trunkHeight;
      const canopyH = p.canopyHeight;
      dummy.position.set(p.x, trunkH / 2, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.set(p.trunkRadius * 2, trunkH, p.trunkRadius * 2);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(p.x, trunkH + canopyH / 2 - 0.2, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.set(p.canopyRadius, canopyH, p.canopyRadius);
      dummy.updateMatrix();
      canopyRef.current!.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
    trunkRef.current.userData.placed = true;
  });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#4a3826" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, count]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#2f5a32" roughness={0.95} />
      </instancedMesh>
    </group>
  );
}

interface Placement {
  x: number;
  z: number;
  rot: number;
  trunkHeight: number;
  trunkRadius: number;
  canopyHeight: number;
  canopyRadius: number;
}

function buildPlacements(
  count: number,
  innerRadius: number,
  outerRadius: number,
  seed: number,
): Placement[] {
  const random = mulberry32(seed);
  const out: Placement[] = [];
  for (let i = 0; i < count; i++) {
    // Square-root weighting biases trees outward, leaving a clear ring
    // around the film-tree region.
    const t = Math.sqrt(random());
    const r = innerRadius + t * (outerRadius - innerRadius);
    const theta = random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const sizeJitter = 0.7 + random() * 0.9; // 0.7–1.6
    const trunkHeight = 1.6 * sizeJitter;
    const trunkRadius = 0.18 * sizeJitter;
    const canopyHeight = 2.4 * sizeJitter;
    const canopyRadius = 1.1 * sizeJitter;

    out.push({
      x,
      z,
      rot: random() * Math.PI * 2,
      trunkHeight,
      trunkRadius,
      canopyHeight,
      canopyRadius,
    });
  }
  return out;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
