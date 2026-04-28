import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { AtomVisualProps } from "../../index.js";

export interface StarProps {
  visual: AtomVisualProps;
  onSelect?: () => void;
}

/**
 * One film as a star. Color is HSL-derived from the realm mapping's hue +
 * intensity. Each star pulses on its own phase so a thousand of them don't
 * breathe in lockstep — gives the field life without per-star animation
 * state.
 */
export function Star({ visual, onSelect }: StarProps) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = visual.position[0] * 0.7 + visual.position[2] * 0.3;
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.8 + phase) * 0.05;
    ref.current.scale.setScalar(visual.scale * pulse);
  });

  const lightness = 50 + visual.intensity * 25;
  const color = `hsl(${visual.hue}, 75%, ${lightness}%)`;

  return (
    <mesh
      ref={ref}
      position={visual.position}
      onClick={
        onSelect
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
