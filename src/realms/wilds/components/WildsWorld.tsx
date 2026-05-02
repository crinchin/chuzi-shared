import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { ReactNode } from "react";
import { ForestBackdrop } from "./ForestBackdrop.js";

const SKY = "#0e1030";
const GROUND_COLOR = "#2a5a35";

export interface WildsWorldProps {
  children: ReactNode;
  /** Pixel device ratio cap. Default [1,2] — keeps perf bounded on retina laptops. */
  dpr?: number | [number, number];
}

/**
 * Wilds environment shell. A lush forest under a cosmic sky — the stars
 * visible overhead are the same cosmos the director may have just left.
 * Bright hemisphere + directional lighting keeps the canopy vivid even
 * against the dark backdrop.
 */
export function WildsWorld({ children, dpr = [1, 2] }: WildsWorldProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, 36], fov: 60, near: 0.1, far: 500 }}
      dpr={dpr}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 70, 180]} />
      <Stars
        radius={180}
        depth={80}
        count={2500}
        factor={4}
        saturation={0.5}
        fade
        speed={0.8}
      />
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#f0f8ff", "#3a5a38", 1.2]} />
      <directionalLight position={[10, 30, 8]} intensity={1.5} color="#fff5e0" />
      <Ground />
      <ForestBackdrop />
      <OrbitControls
        enablePan={false}
        maxDistance={80}
        minDistance={6}
        maxPolarAngle={Math.PI / 2.05}
      />
      {children}
    </Canvas>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[120, 64]} />
      <meshStandardMaterial color={GROUND_COLOR} roughness={0.9} />
    </mesh>
  );
}
