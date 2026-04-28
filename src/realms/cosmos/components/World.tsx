import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars as DreiStars } from "@react-three/drei";
import type { ReactNode } from "react";
import { THEME_TOKENS } from "../../../themes/index.js";

export interface WorldProps {
  children: ReactNode;
  /** Pixel device ratio cap. Default 2 — keeps perf bounded on retina laptops. */
  dpr?: number | [number, number];
}

/**
 * Cosmos environment shell. Wraps an r3f Canvas with deep-space background,
 * ambient starfield (drei <Stars> for the *backdrop* — distinct from our
 * film-stars), and a placeholder OrbitControls camera. The real NavRig
 * (consuming an IntentSource and doing focus-snap on dpad) replaces
 * OrbitControls in a follow-up package.
 */
export function World({ children, dpr = [1, 2] }: WorldProps) {
  return (
    <Canvas
      camera={{ position: [0, 6, 32], fov: 60, near: 0.1, far: 500 }}
      dpr={dpr}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[THEME_TOKENS.cosmos.bgDeep]} />
      <ambientLight intensity={0.15} />
      <DreiStars
        radius={120}
        depth={60}
        count={3000}
        factor={4}
        fade
        saturation={0.4}
      />
      <OrbitControls enablePan={false} maxDistance={80} minDistance={4} />
      {children}
    </Canvas>
  );
}
