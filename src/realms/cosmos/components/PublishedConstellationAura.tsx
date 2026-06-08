import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { PublishedDustAppearance } from "../appearance.js";
import type { ConstellationBounds } from "./ConstellationTitle.js";

interface DustParticle {
  angle: number;
  radius: number;
  yOffset: number;
  phase: number;
  size: number;
  drift: number;
}

export interface PublishedConstellationAuraProps {
  bounds: ConstellationBounds;
  dust: PublishedDustAppearance;
}

/**
 * Soft dust motes swirling around a launched constellation. Driven entirely
 * by theme tokens so admins can tune count, speed, and color.
 */
export function PublishedConstellationAura({
  bounds,
  dust,
}: PublishedConstellationAuraProps) {
  const groupRef = useRef<Group>(null);

  const particles = useMemo<DustParticle[]>(() => {
    const items: DustParticle[] = [];
    for (let i = 0; i < dust.count; i++) {
      items.push({
        angle: (i / dust.count) * Math.PI * 2,
        radius: dust.orbitRadius * (0.65 + (i % 5) * 0.08),
        yOffset: ((i % 7) - 3) * 0.35,
        phase: (i * 0.73) % (Math.PI * 2),
        size: 0.035 + (i % 4) * 0.015,
        drift: 0.6 + (i % 3) * 0.25,
      });
    }
    return items;
  }, [dust.count, dust.orbitRadius]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * dust.speed;
    const rx = bounds.spanX * 0.5;
    const rz = bounds.spanZ * 0.5;

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const a = p.angle + t * p.drift + p.phase;
      child.position.set(
        Math.cos(a) * rx * p.radius,
        p.yOffset + Math.sin(t * 1.4 + p.phase) * 0.45,
        Math.sin(a) * rz * p.radius,
      );
    });
  });

  return (
    <group ref={groupRef} position={bounds.center}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial
            color={dust.color}
            transparent
            opacity={dust.opacity}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
