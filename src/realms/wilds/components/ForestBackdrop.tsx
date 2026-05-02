import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { InstancedMesh } from "three";
import { Object3D, Color } from "three";

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
 * Ambient surrounding forest. Three overlapping canopy layers per tree
 * (dodecahedrons at staggered offsets) give the backdrop lush, full
 * silhouettes. Four instanced draw calls total (trunk + 3 canopy layers)
 * keep the cost constant regardless of count.
 */
export function ForestBackdrop({
  count = 320,
  innerRadius = 36,
  outerRadius = 78,
  seed = 7,
}: ForestBackdropProps) {
  const trunkRef = useRef<InstancedMesh>(null);
  const canopy1Ref = useRef<InstancedMesh>(null);
  const canopy2Ref = useRef<InstancedMesh>(null);
  const canopy3Ref = useRef<InstancedMesh>(null);

  const placements = useMemo(
    () => buildPlacements(count, innerRadius, outerRadius, seed),
    [count, innerRadius, outerRadius, seed],
  );

  useFrame(() => {
    const trunk = trunkRef.current;
    const c1 = canopy1Ref.current;
    const c2 = canopy2Ref.current;
    const c3 = canopy3Ref.current;
    if (!trunk || !c1 || !c2 || !c3) return;
    if (trunk.userData.placed) return;

    const dummy = new Object3D();
    const color = new Color();

    placements.forEach((p, i) => {
      const trunkH = p.trunkHeight;
      const canopyH = p.canopyHeight;
      const canopyR = p.canopyRadius;

      dummy.position.set(p.x, trunkH / 2, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.set(p.trunkRadius * 2, trunkH, p.trunkRadius * 2);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);

      dummy.position.set(p.x, trunkH + canopyH * 0.3, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.set(canopyR * 0.9, canopyH * 0.5, canopyR * 0.9);
      dummy.updateMatrix();
      c1.setMatrixAt(i, dummy.matrix);

      const off2x = Math.cos(p.rot + 0.8) * canopyR * 0.35;
      const off2z = Math.sin(p.rot + 0.8) * canopyR * 0.35;
      dummy.position.set(p.x + off2x, trunkH + canopyH * 0.5, p.z + off2z);
      dummy.rotation.set(0, p.rot * 1.3, 0);
      dummy.scale.set(canopyR * 0.7, canopyH * 0.4, canopyR * 0.7);
      dummy.updateMatrix();
      c2.setMatrixAt(i, dummy.matrix);

      const off3x = Math.cos(p.rot + 3.2) * canopyR * 0.4;
      const off3z = Math.sin(p.rot + 3.2) * canopyR * 0.4;
      dummy.position.set(p.x + off3x, trunkH + canopyH * 0.1, p.z + off3z);
      dummy.rotation.set(0, p.rot * 0.7, 0);
      dummy.scale.set(canopyR * 0.55, canopyH * 0.35, canopyR * 0.55);
      dummy.updateMatrix();
      c3.setMatrixAt(i, dummy.matrix);

      const hue = BACKDROP_HUES[i % BACKDROP_HUES.length];
      color.setHSL(hue / 360, 0.5, 0.36);
      c1.setColorAt(i, color);
      color.setHSL(hue / 360, 0.5, 0.4);
      c2.setColorAt(i, color);
      color.setHSL(hue / 360, 0.5, 0.32);
      c3.setColorAt(i, color);
    });

    trunk.instanceMatrix.needsUpdate = true;
    c1.instanceMatrix.needsUpdate = true;
    c2.instanceMatrix.needsUpdate = true;
    c3.instanceMatrix.needsUpdate = true;
    if (c1.instanceColor) c1.instanceColor.needsUpdate = true;
    if (c2.instanceColor) c2.instanceColor.needsUpdate = true;
    if (c3.instanceColor) c3.instanceColor.needsUpdate = true;
    trunk.userData.placed = true;
  });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={canopy1Ref} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={canopy2Ref} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={canopy3Ref} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

const BACKDROP_HUES = [120, 140, 100, 160, 80, 150, 95, 130, 110, 170];

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
    const t = Math.sqrt(random());
    const r = innerRadius + t * (outerRadius - innerRadius);
    const theta = random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const sizeJitter = 0.7 + random() * 0.9;
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
