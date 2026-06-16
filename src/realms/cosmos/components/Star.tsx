import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { AtomVisualProps } from "../../index.js";
import type { FocusEffectAppearance } from "../appearance.js";

export interface StarProps {
  visual: AtomVisualProps;
  onSelect?: () => void;
  /** Reduce brightness and saturation to indicate an unwatched scene. */
  dimmed?: boolean;
  /** Non-navigable — suppresses click and lowers brightness further. */
  locked?: boolean;
  /** Launched-story boost — extra saturation and lightness from theme tokens. */
  publishedBoost?: { saturationBoost: number; lightnessBoost: number };
  /** Selected story system — intensified pulse from focusEffect tokens. */
  focused?: boolean;
  focusEffect?: FocusEffectAppearance;
}

/**
 * One film as a star. Color is HSL-derived from the realm mapping's hue +
 * intensity. Each star pulses on its own phase so a thousand of them don't
 * breathe in lockstep — gives the field life without per-star animation
 * state.
 */
export function Star({
  visual,
  onSelect,
  dimmed,
  locked,
  publishedBoost,
  focused = false,
  focusEffect,
}: StarProps) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = visual.position[0] * 0.7 + visual.position[2] * 0.3;
    const focusActive = focused && focusEffect?.enabled;
    const pulseAmp = focusActive
      ? focusEffect.starPulseAmplitude
      : publishedBoost
        ? 0.08
        : 0.05;
    const pulseSpeed = focusActive ? focusEffect.starPulseSpeed : 0.8;
    const pulse = 1 + Math.sin(clock.elapsedTime * pulseSpeed + phase) * pulseAmp;
    ref.current.scale.setScalar(visual.scale * pulse);
  });

  const boostSat = publishedBoost?.saturationBoost ?? 0;
  const boostLight = publishedBoost?.lightnessBoost ?? 0;
  const focusActive = focused && focusEffect?.enabled;
  const saturation =
    (dimmed || locked ? 25 : 75) + boostSat + (focusActive ? 12 : 0);
  const lightness =
    (dimmed || locked
      ? 25 + visual.intensity * 10
      : 50 + visual.intensity * 25) +
    boostLight +
    (focusActive ? 10 : 0);
  const color = `hsl(${visual.hue}, ${saturation}%, ${lightness}%)`;

  const handleClick = locked
    ? undefined
    : onSelect
      ? (e: any) => {
          e.stopPropagation();
          onSelect();
        }
      : undefined;

  return (
    <mesh
      ref={ref}
      position={visual.position}
      onClick={handleClick}
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial
        color={color}
        toneMapped={false}
        transparent={!!(dimmed || locked)}
        opacity={dimmed ? 0.35 : locked ? 0.25 : 1}
      />
    </mesh>
  );
}
