import { Html, Billboard } from "@react-three/drei";

export interface ClusterLabelProps {
  position: [number, number, number];
  label: string;
  color?: string;
  /** Brighter glow when this cluster contains the focused story. */
  highlighted?: boolean;
  /** Vertical lift above cluster center (world units). */
  offsetY?: number;
  /** Hide the in-world label (e.g. when the HUD already shows it). */
  hidden?: boolean;
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
  offsetY = 12,
  hidden = false,
}: ClusterLabelProps) {
  if (hidden || !label.trim()) return null;

  const labelY = position[1] + offsetY;

  return (
    <Billboard position={[position[0], labelY, position[2]]} follow>
      <Html
        center
        zIndexRange={[12, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            display: "inline-block",
            width: "max-content",
            maxWidth: "min(90vw, 420px)",
            fontFamily: "'Inter', sans-serif",
            fontSize: highlighted ? "20px" : "16px",
            fontWeight: highlighted ? 700 : 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
            padding: highlighted ? "8px 18px" : "6px 14px",
            borderRadius: 8,
            background: "rgba(4,10,20,0.9)",
            border: highlighted
              ? `1px solid ${color}99`
              : `1px solid ${color}44`,
            boxShadow: highlighted
              ? `0 0 24px ${color}55, 0 4px 20px rgba(0,0,0,0.85)`
              : "0 2px 16px rgba(0,0,0,0.8)",
            filter: highlighted ? "brightness(1.2) saturate(1.25)" : undefined,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </Html>
    </Billboard>
  );
}
