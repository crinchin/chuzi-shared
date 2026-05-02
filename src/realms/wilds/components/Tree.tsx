import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { AtomVisualProps } from "../../index.js";

export interface TreeProps {
  visual: AtomVisualProps;
  onSelect?: () => void;
}

/**
 * A single film-tree with a lush, multi-clustered canopy. Foliage is built
 * from overlapping dodecahedrons arranged around the crown — reads as a
 * dense, heavily-branched tree. Trees within a genre clump share the same
 * hue; brightness scales with popularity.
 */
export function Tree({ visual, onSelect }: TreeProps) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = visual.position[0] * 0.4 + visual.position[2] * 0.6;
    const sway = Math.sin(clock.elapsedTime * 0.6 + phase) * 0.04;
    ref.current.rotation.z = sway;
  });

  const trunkHeight = 1.6 + visual.scale * 2.4;
  const trunkRadius = 0.09 + visual.scale * 0.055;
  const lightness = 52 + visual.intensity * 18;
  const canopyColor = `hsl(${visual.hue}, 82%, ${lightness}%)`;
  const trunkColor = "#6b5a45";

  const seed = Math.abs(Math.round(visual.position[0] * 127 + visual.position[2] * 311));

  const foliage = useMemo(() => {
    const clusters: { x: number; y: number; z: number; r: number }[] = [];
    const crownY = trunkHeight * 0.78;
    const baseR = 0.65 + visual.scale * 0.5 + visual.intensity * 0.3;

    clusters.push({ x: 0, y: crownY + baseR * 0.35, z: 0, r: baseR });
    clusters.push({ x: 0, y: crownY + baseR * 0.95, z: 0, r: baseR * 0.55 });

    const mainCount = 5 + Math.floor(visual.scale * 3);
    for (let i = 0; i < mainCount; i++) {
      const a = (i / mainCount) * Math.PI * 2 + (seed % 100) * 0.063;
      const spread = baseR * (0.6 + ((seed + i * 7) % 5) * 0.09);
      const yOff = ((seed + i * 13) % 7 - 3) * 0.1;
      const sz = baseR * (0.38 + ((seed + i * 11) % 5) * 0.07);
      clusters.push({
        x: Math.cos(a) * spread,
        y: crownY + yOff,
        z: Math.sin(a) * spread,
        r: sz,
      });
    }

    const lowerCount = 3 + Math.floor(visual.scale * 2);
    for (let i = 0; i < lowerCount; i++) {
      const a = (i / lowerCount) * Math.PI * 2 + (seed % 50) * 0.126;
      const spread = baseR * 0.85 + 0.25;
      clusters.push({
        x: Math.cos(a) * spread,
        y: crownY - 0.35 - ((seed + i * 17) % 4) * 0.12,
        z: Math.sin(a) * spread,
        r: baseR * (0.28 + ((seed + i * 7) % 3) * 0.06),
      });
    }

    return clusters;
  }, [trunkHeight, visual.scale, visual.intensity, seed]);

  function handleClick(e: { stopPropagation: () => void }) {
    if (!onSelect) return;
    e.stopPropagation();
    onSelect();
  }

  const onClick = onSelect ? handleClick : undefined;

  return (
    <group ref={ref} position={visual.position}>
      <mesh position={[0, trunkHeight / 2, 0]} onClick={onClick}>
        <cylinderGeometry args={[trunkRadius * 0.65, trunkRadius, trunkHeight, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      {foliage.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} onClick={onClick}>
          <dodecahedronGeometry args={[c.r, 1]} />
          <meshStandardMaterial color={canopyColor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
