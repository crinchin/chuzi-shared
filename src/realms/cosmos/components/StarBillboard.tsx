import { Html } from "@react-three/drei";
import type { ReactNode } from "react";
import type { ConstellationAppearance } from "../appearance.js";

export interface StarBillboardProps {
  label: string;
  appearance: ConstellationAppearance;
  previewImageUrl?: string | null;
  previewContent?: ReactNode;
  dimmed?: boolean;
  focused?: boolean;
}

/**
 * Floating preview card and scene label above a star. Label sits beneath
 * the preview image, offset from the star sphere.
 */
export function StarBillboard({
  label,
  appearance,
  previewImageUrl,
  previewContent,
  dimmed,
  focused,
}: StarBillboardProps) {
  const borderColor = focused
    ? "rgba(126,184,255,0.65)"
    : "rgba(126,184,255,0.28)";
  const opacity = dimmed ? 0.45 : focused ? 1 : 0.88;

  return (
    <Html
      position={[0, appearance.previewOffsetY, 0]}
      center
      distanceFactor={appearance.billboardDistanceFactor}
      style={{
        pointerEvents: "none",
        userSelect: "none",
        opacity,
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: appearance.labelGap,
        }}
      >
        <div
          style={{
            width: appearance.previewWidth,
            height: appearance.previewHeight,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${borderColor}`,
            background: "rgba(4,7,13,0.92)",
            boxShadow: focused
              ? "0 0 24px rgba(126,184,255,0.35)"
              : "0 4px 20px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            previewContent ?? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(ellipse at 30% 20%, rgba(80,120,200,0.2) 0%, rgba(10,14,30,0.95) 70%)",
                }}
              />
            )
          )}
        </div>

        <div
          style={{
            fontSize: appearance.labelFontSize,
            fontWeight: 700,
            letterSpacing: appearance.labelLetterSpacing,
            textTransform: "uppercase",
            color: focused ? "rgba(232,240,255,0.95)" : "rgba(232,240,255,0.72)",
            textAlign: "center",
            textShadow: "0 2px 12px rgba(0,0,0,0.95)",
            whiteSpace: "nowrap",
            maxWidth: appearance.previewWidth + 40,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </Html>
  );
}
