import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { AtomVisualProps } from "../../index.js";

export interface TreeProps {
  visual: AtomVisualProps;
  onSelect?: () => void;
}

/**
 * One film as a tree. Foliage color is HSL-derived from the realm
 * mapping's hue + intensity. Each tree sways on its own phase so the
 * grove doesn't ripple in lockstep — gives the forest life without
 * per-tree animation state.
 */
export function Tree({ visual, onSelect }: TreeProps) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = visual.position[0] * 0.4 + visual.position[2] * 0.6;
    const sway = Math.sin(clock.elapsedTime * 0.6 + phase) * 0.04;
    ref.current.rotation.z = sway;
  });

  // Trunk height/radius scale together with visual.scale; canopy size
  // gets a small extra boost from intensity (popularity = lusher canopy).
  const trunkHeight = 1.2 + visual.scale * 1.6;
  const trunkRadius = 0.12 + visual.scale * 0.08;
  const canopyRadius = 0.85 + visual.scale * 0.6 + visual.intensity * 0.4;
  const canopyHeight = 1.6 + visual.scale * 1.0 + visual.intensity * 0.5;

  // Wilds palette: shift toward saturated greens, with the realm-mapped
  // hue offset producing species variation (yellow-oak, pine-cool,
  // pink-cherry, umber-dead, etc).
  const lightness = 30 + visual.intensity * 20;
  const canopyColor = `hsl(${visual.hue}, 55%, ${lightness}%)`;
  const trunkColor = "#5a4530";

  function handleClick(e: { stopPropagation: () => void }) {
    if (!onSelect) return;
    e.stopPropagation();
    onSelect();
  }

  return (
    <group ref={ref} position={visual.position}>
      <mesh
        position={[0, trunkHeight / 2, 0]}
        onClick={onSelect ? handleClick : undefined}
      >
        <cylinderGeometry args={[trunkRadius * 0.85, trunkRadius, trunkHeight, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.95} />
      </mesh>
      <mesh
        position={[0, trunkHeight + canopyHeight / 2 - 0.2, 0]}
        onClick={onSelect ? handleClick : undefined}
      >
        <coneGeometry args={[canopyRadius, canopyHeight, 10]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} />
      </mesh>
    </group>
  );
}
