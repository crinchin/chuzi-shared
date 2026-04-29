import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ReactNode } from "react";
import { ForestBackdrop } from "./ForestBackdrop.js";

const SKY = "#4a6b58";
const GROUND_COLOR = "#2e4030";

export interface WildsWorldProps {
  children: ReactNode;
  /** Pixel device ratio cap. Default [1,2] — keeps perf bounded on retina laptops. */
  dpr?: number | [number, number];
}

/**
 * Wilds environment shell. Wraps an r3f Canvas with a deep-forest ambient
 * background, a soft ground plane, hemispheric lighting (warm sky + cool
 * ground), and a surrounding `ForestBackdrop` so film trees sit *inside*
 * a forest rather than alone on a circle. Mirrors cosmos/World — film
 * atoms render as children, ambient backdrop is provided by the realm.
 */
export function WildsWorld({ children, dpr = [1, 2] }: WildsWorldProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, 36], fov: 60, near: 0.1, far: 500 }}
      dpr={dpr}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 50, 140]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#dff2d4", "#3a5238", 1.1]} />
      <directionalLight position={[10, 20, 8]} intensity={1.1} />
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
      <meshStandardMaterial color={GROUND_COLOR} roughness={1} />
    </mesh>
  );
}
