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
  visible?: boolean;
  /** Control strip rendered flush beneath the preview when focused. */
  controlsSlot?: ReactNode;
}

/**
 * Floating preview card and scene label above a star. Unfocused previews
 * are dimmed; labels stay prominent. Anchor sits at preview bottom-center
 * so attached controls align with the card edge.
 */
export function StarBillboard({
  label,
  appearance,
  previewImageUrl,
  previewContent,
  dimmed,
  focused,
  visible = true,
  controlsSlot,
}: StarBillboardProps) {
  if (!visible) return null;

  const borderColor = focused
    ? "rgba(126,184,255,0.75)"
    : "rgba(126,184,255,0.22)";
  const previewOpacity = focused ? 1 : dimmed ? 0.22 : 0.34;
  const previewFilter = focused
    ? "brightness(1.08) saturate(1.1)"
    : "brightness(0.72) saturate(0.65)";
  const hasControls = !!(focused && controlsSlot);

  return (
    <Html
      position={[0, appearance.previewOffsetY, 0]}
      center
      transform
      distanceFactor={appearance.billboardDistanceFactor}
      zIndexRange={appearance.htmlZIndexRange}
      occlude={false}
      style={{
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes chuziPreviewFocusIn {
          0% { opacity: 0.4; transform: scale(0.9); filter: brightness(0.8) saturate(0.7); }
          55% { opacity: 1; transform: scale(1.05); filter: brightness(1.12) saturate(1.15); }
          100% { opacity: 1; transform: scale(1); filter: brightness(1.08) saturate(1.1); }
        }
        @keyframes chuziPreviewFocusOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: ${previewOpacity}; transform: scale(0.96); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(-${appearance.previewHeight / 2}px)`,
        }}
      >
        <div
          key={focused ? "focused" : "unfocused"}
          style={{
            width: appearance.previewWidth,
            height: appearance.previewHeight,
            borderRadius: hasControls ? "8px 8px 0 0" : 8,
            overflow: "hidden",
            border: `1px solid ${borderColor}`,
            borderBottom: hasControls ? "none" : `1px solid ${borderColor}`,
            background: "rgba(4,7,13,0.92)",
            boxShadow: focused
              ? "0 0 28px rgba(126,184,255,0.45), 0 4px 24px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: previewOpacity,
            filter: previewFilter,
            transition: "border-color 0.35s ease, box-shadow 0.35s ease",
            animation: focused
              ? "chuziPreviewFocusIn 0.48s cubic-bezier(0.34, 1.45, 0.64, 1) forwards"
              : "chuziPreviewFocusOut 0.32s ease forwards",
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

        {hasControls ? (
          <div
            style={{
              width: appearance.previewWidth,
              pointerEvents: "auto",
              flexShrink: 0,
            }}
          >
            {controlsSlot}
          </div>
        ) : null}

        {appearance.showSceneLabels && label ? (
          <div
            style={{
              marginTop: appearance.labelGap,
              fontSize: appearance.labelFontSize,
              fontWeight: 700,
              letterSpacing: appearance.labelLetterSpacing,
              textTransform: "uppercase",
              color: "rgba(232,240,255,0.96)",
              textAlign: "center",
              textShadow:
                "0 0 18px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.95), 0 0 6px rgba(126,184,255,0.25)",
              whiteSpace: "normal",
              lineHeight: 1.2,
              maxWidth: appearance.labelMaxWidth,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </Html>
  );
}
