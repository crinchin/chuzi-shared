import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ReactNode } from "react";
import { THEME_TOKENS } from "../../../themes/index.js";

export interface WildsWorldProps {
  children: ReactNode;
  /** Pixel device ratio cap. Default [1,2] — keeps perf bounded on retina laptops. */
  dpr?: number | [number, number];
}

/**
 * Wilds environment shell. Wraps an r3f Canvas with a deep-forest ambient
 * background, a soft ground plane, hemispheric lighting (warm sky + cool
 * ground), and OrbitControls as a placeholder camera. Trees live as
 * children. Mirrors the role of cosmos/World, swapped for forest semantics.
 */
export function WildsWorld({ children, dpr = [1, 2] }: WildsWorldProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, 36], fov: 60, near: 0.1, far: 500 }}
      dpr={dpr}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[THEME_TOKENS.wilds.bgDeep]} />
      <fog attach="fog" args={[THEME_TOKENS.wilds.bgDeep, 30, 90]} />
      <hemisphereLight args={["#cfe9c2", "#1a2a18", 0.85]} />
      <directionalLight position={[10, 20, 8]} intensity={0.6} />
      <Ground />
      <OrbitControls enablePan={false} maxDistance={80} minDistance={6} maxPolarAngle={Math.PI / 2.05} />
      {children}
    </Canvas>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[80, 64]} />
      <meshStandardMaterial color="#152018" roughness={1} />
    </mesh>
  );
}
