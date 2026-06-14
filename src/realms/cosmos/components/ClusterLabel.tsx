import { Html, Billboard } from "@react-three/drei";

export interface ClusterLabelProps {
  position: [number, number, number];
  label: string;
  color?: string;
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
}: ClusterLabelProps) {
  const labelY = position[1] + 12;

  return (
    <Billboard position={[position[0], labelY, position[2]]} follow>
      <Html
        transform
        distanceFactor={45}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color,
            textShadow: `0 0 12px ${color}, 0 0 24px ${color}40`,
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
