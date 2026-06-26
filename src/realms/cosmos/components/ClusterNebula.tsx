import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Points as ThreePoints } from "three";
import * as THREE from "three";

export interface ClusterNebulaProps {
  center: [number, number, number];
  radius: number;
  color: string;
  opacity?: number;
  particleCount?: number;
  /** Brighter nebula when this cluster contains the focused story. */
  highlighted?: boolean;
}

interface DustMote {
  angle: number;
  orbit: number;
  yOffset: number;
  phase: number;
  size: number;
  drift: number;
}

/**
 * Volumetric nebula/gas cloud rendered as a subtle particle system with
 * orbiting dust motes for a swirling gas effect.
 */
export function ClusterNebula({
  center,
  radius,
  color,
  opacity = 0.12,
  particleCount = 300,
  highlighted = false,
}: ClusterNebulaProps) {
  const pointsRef = useRef<ThreePoints>(null);
  const dustRef = useRef<Group>(null);
  const resolvedOpacity = highlighted ? Math.min(opacity * 2.6, 0.32) : opacity;
  const resolvedCount = highlighted ? Math.round(particleCount * 1.35) : particleCount;
  const dustCount = highlighted ? 36 : 22;

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(resolvedCount * 3);
    const sz = new Float32Array(resolvedCount);
    for (let i = 0; i < resolvedCount; i++) {
      const r = Math.pow(Math.random(), 0.6) * radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = 0.4 + Math.random() * 1.2;
    }
    return { positions: pos, sizes: sz };
  }, [resolvedCount, radius]);

  const dustMotes = useMemo<DustMote[]>(() => {
    const items: DustMote[] = [];
    for (let i = 0; i < dustCount; i++) {
      items.push({
        angle: (i / dustCount) * Math.PI * 2,
        orbit: 0.55 + (i % 5) * 0.09,
        yOffset: ((i % 7) - 3) * radius * 0.04,
        phase: (i * 0.71) % (Math.PI * 2),
        size: 0.05 + (i % 4) * 0.025,
        drift: 0.45 + (i % 4) * 0.18,
      });
    }
    return items;
  }, [dustCount, radius]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pointsRef.current) {
      const spin = highlighted ? 0.018 : 0.011;
      pointsRef.current.rotation.y = t * spin;
      pointsRef.current.rotation.x = Math.sin(t * 0.003) * 0.03;
    }
    if (dustRef.current) {
      const speed = highlighted ? 0.55 : 0.38;
      dustRef.current.children.forEach((child, i) => {
        const mote = dustMotes[i];
        if (!mote) return;
        const a = mote.angle + t * speed * mote.drift + mote.phase;
        child.position.set(
          Math.cos(a) * radius * mote.orbit,
          mote.yOffset + Math.sin(t * 1.2 + mote.phase) * radius * 0.06,
          Math.sin(a) * radius * mote.orbit,
        );
      });
    }
  });

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const dustOpacity = highlighted ? 0.55 : 0.38;

  return (
    <group position={center}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={resolvedCount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={sizes}
            count={resolvedCount}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={highlighted ? 1.65 : 1.35}
          transparent
          opacity={resolvedOpacity}
          map={texture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <group ref={dustRef}>
        {dustMotes.map((mote, i) => (
          <mesh key={i}>
            <sphereGeometry args={[mote.size, 6, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={dustOpacity}
              toneMapped={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
