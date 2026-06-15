import { Html, Billboard } from "@react-three/drei";

export interface ClusterLabelProps {
  position: [number, number, number];
  label: string;
  color?: string;
  /** Brighter glow when this cluster contains the focused story. */
  highlighted?: boolean;
}

/**
 * Floating cluster-level label rendered above each nebula region.
 * Visually distinct from constellation titles: uppercase, wide tracking,
 * outer glow, no arc.
 */
export function ClusterLabel({
  position,
  label,
  color = "#8ec8f8",
  highlighted = false,
}: ClusterLabelProps) {
  const labelY = position[1] + 12;

  return (
    <Billboard position={[position[0], labelY, position[2]]} follow>
      <Html
        transform
        distanceFactor={highlighted ? 52 : 45}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: highlighted ? "18px" : "14px",
            fontWeight: highlighted ? 700 : 600,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: highlighted ? color : color,
            textShadow: highlighted
              ? `0 0 8px ${color}, 0 0 20px ${color}, 0 0 40px ${color}, 0 0 64px ${color}80`
              : `0 0 12px ${color}, 0 0 24px ${color}40`,
            filter: highlighted ? "brightness(1.35) saturate(1.4)" : undefined,
            whiteSpace: "nowrap",
            userSelect: "none",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </Html>
    </Billboard>
  );
}
