import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points as ThreePoints } from "three";
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

/**
 * Volumetric nebula/gas cloud rendered as a subtle particle system.
 * Positioned behind each cluster to visually group constellations.
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
  const resolvedOpacity = highlighted ? Math.min(opacity * 2.8, 0.28) : opacity;
  const resolvedCount = highlighted ? Math.round(particleCount * 1.35) : particleCount;

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

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const spin = highlighted ? 0.014 : 0.008;
    pointsRef.current.rotation.y = clock.elapsedTime * spin;
    pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.003) * 0.02;
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

  return (
    <points ref={pointsRef} position={center}>
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
        size={highlighted ? 1.55 : 1.2}
        transparent
        opacity={resolvedOpacity}
        map={texture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
