import { useId, type ReactNode } from "react";
import { Billboard, Html } from "@react-three/drei";
import type { ConstellationAppearance } from "../appearance.js";

export interface ConstellationBounds {
  center: [number, number, number];
  spanX: number;
  spanZ: number;
}

export function computeConstellationBounds(
  positions: [number, number, number][],
): ConstellationBounds | null {
  if (positions.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let sumY = 0;

  for (const [x, y, z] of positions) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    sumY += y;
  }

  return {
    center: [(minX + maxX) / 2, sumY / positions.length, (minZ + maxZ) / 2],
    spanX: Math.max(10, maxX - minX + 6),
    spanZ: Math.max(8, maxZ - minZ + 5),
  };
}

export interface ConstellationStoryOverlay {
  /** Localized prefix, e.g. "Chosen by". */
  chosenByPrefix: string;
  directorName?: string | null;
  directorAvatarUrl?: string | null;
  /** Procedural avatar when no uploaded photo (e.g. constellation seal). */
  directorAvatarFallback?: ReactNode;
  contentRating?: string | null;
  genre?: string | null;
  /** Shown between rating and genre. */
  ratingGenreSeparator?: string;
  /** When true the arched title is clickable. */
  editable?: boolean;
  onEditClick?: () => void;
  /** Accessible label for the editable title control. */
  editAriaLabel?: string;
}

export interface ConstellationTitleProps {
  title: string;
  bounds: ConstellationBounds;
  appearance: ConstellationAppearance;
  /** World position of the title (first) scene — arc starts here. */
  arcFrom?: [number, number, number];
  /** World position of the last scene — arc ends here. */
  arcTo?: [number, number, number];
  storyOverlay?: ConstellationStoryOverlay;
}

const WORLD_TO_SVG = 58;
const ARC_HORIZONTAL_PAD = 72;

/** Rough path length needed for arched uppercase title typography. */
function estimateTitlePathWidth(
  title: string,
  fontSize: number,
  letterSpacing: number,
): number {
  const chars = title.trim().length;
  if (chars === 0) return 0;
  const glyphWidth = fontSize * 0.62;
  return chars * glyphWidth + Math.max(0, chars - 1) * letterSpacing + 56;
}

/**
 * Vintage cartography-style ocean label arcing from title scene to last scene.
 */
export function ConstellationTitle({
  title,
  bounds,
  appearance,
  arcFrom,
  arcTo,
  storyOverlay,
}: ConstellationTitleProps) {
  const gradientId = useId().replace(/:/g, "");
  const pathId = `arc-${gradientId}`;

  if (!title.trim()) return null;

  const titlePos = bounds.center;
  const minArcSpan = Math.max(
    300,
    estimateTitlePathWidth(
      title,
      appearance.titleFontSize,
      appearance.titleLetterSpacing,
    ),
  );

  const titleOffsetX =
    arcFrom != null
      ? (arcFrom[0] - bounds.center[0]) * WORLD_TO_SVG
      : -minArcSpan / 2;
  const endOffsetX =
    arcTo != null
      ? (arcTo[0] - bounds.center[0]) * WORLD_TO_SVG
      : minArcSpan / 2;
  const arcSpanNeeded = Math.max(
    minArcSpan,
    Math.abs(endOffsetX - titleOffsetX) + 48,
  );
  const svgWidth = Math.max(
    420,
    Math.ceil(arcSpanNeeded + ARC_HORIZONTAL_PAD * 2),
  );
  const svgHeight = 110;
  const viewPadX = 28;
  const viewPadY = 10;

  const centerX = svgWidth / 2;
  const arcY = svgHeight * 0.88;
  const arcPeak = svgHeight * 0.06;

  let arcStartX = centerX + titleOffsetX;
  let arcEndX = centerX + endOffsetX;

  if (arcStartX > arcEndX) {
    const swap = arcStartX;
    arcStartX = arcEndX;
    arcEndX = swap;
  }

  if (arcEndX - arcStartX < minArcSpan) {
    const mid = (arcStartX + arcEndX) / 2;
    arcStartX = mid - minArcSpan / 2;
    arcEndX = mid + minArcSpan / 2;
  }

  const arcMargin = ARC_HORIZONTAL_PAD / 2;
  arcStartX = Math.max(arcMargin, arcStartX);
  arcEndX = Math.min(svgWidth - arcMargin, arcEndX);
  if (arcEndX - arcStartX < minArcSpan) {
    arcStartX = centerX - minArcSpan / 2;
    arcEndX = centerX + minArcSpan / 2;
  }

  const arcMidX = (arcStartX + arcEndX) / 2;
  const arcPath = `M ${arcStartX} ${arcY} Q ${arcMidX} ${arcPeak} ${arcEndX} ${arcY}`;

  const editable = !!(storyOverlay?.editable && storyOverlay.onEditClick);
  const hasDirector = !!(
    storyOverlay?.directorName && storyOverlay.directorName.trim()
  );
  const hasRatingGenre = !!(
    storyOverlay?.contentRating || storyOverlay?.genre
  );
  const showOverlay = hasDirector || hasRatingGenre;

  const titleControl = (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`${-viewPadX} ${-viewPadY} ${svgWidth + viewPadX * 2} ${svgHeight + viewPadY}`}
      style={{
        overflow: "visible",
        display: "block",
        cursor: editable ? "pointer" : undefined,
      }}
      aria-hidden={editable ? undefined : true}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={editable ? storyOverlay?.editAriaLabel : undefined}
      onClick={editable ? storyOverlay?.onEditClick : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                storyOverlay?.onEditClick?.();
              }
            }
          : undefined
      }
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8ab4c8" />
          <stop offset="35%" stopColor="#c8d8e4" />
          <stop offset="65%" stopColor="#e8dcc8" />
          <stop offset="100%" stopColor="#8ab4c8" />
        </linearGradient>
        <path id={pathId} d={arcPath} fill="none" />
      </defs>
      <text
        fill={`url(#${gradientId})`}
        fontFamily="'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
        fontSize={appearance.titleFontSize}
        fontWeight={700}
        fontStyle="italic"
        letterSpacing={appearance.titleLetterSpacing}
        opacity={appearance.titleOpacity}
        stroke="rgba(20,40,60,0.35)"
        strokeWidth={0.6}
        paintOrder="stroke fill"
        style={{ pointerEvents: "none" }}
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {title.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );

  return (
    <Billboard
      position={[
        titlePos[0],
        titlePos[1] + appearance.titleYOffset,
        titlePos[2],
      ]}
    >
      <Html
        center
        transform
        distanceFactor={appearance.titleDistanceFactor}
        zIndexRange={appearance.htmlZIndexRange}
        occlude={false}
        style={{
          pointerEvents: editable ? "auto" : "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          {titleControl}

          {showOverlay ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                maxWidth: svgWidth,
                marginTop: 6,
                pointerEvents: "none",
              }}
            >
              {hasDirector ? (
                <DirectorCredit
                  prefix={storyOverlay!.chosenByPrefix}
                  name={storyOverlay!.directorName!}
                  avatarUrl={storyOverlay!.directorAvatarUrl ?? null}
                  avatarFallback={storyOverlay!.directorAvatarFallback}
                />
              ) : null}

              {hasRatingGenre ? (
                <RatingGenreLine
                  contentRating={storyOverlay!.contentRating ?? null}
                  genre={storyOverlay!.genre ?? null}
                  separator={storyOverlay!.ratingGenreSeparator ?? " · "}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </Html>
    </Billboard>
  );
}

function DirectorCredit({
  prefix,
  name,
  avatarUrl,
  avatarFallback,
}: {
  prefix: string;
  name: string;
  avatarUrl: string | null;
  avatarFallback?: ReactNode;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "rgba(232,240,255,0.72)",
        letterSpacing: 0.35,
        textShadow: "0 1px 8px rgba(0,0,0,0.95)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ opacity: 0.85 }}>{prefix}</span>
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(126,184,255,0.35)",
          fontSize: 9,
          fontWeight: 700,
          color: "rgba(232,240,255,0.9)",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : avatarFallback ? (
          avatarFallback
        ) : (
          initial
        )}
      </span>
      <span style={{ fontWeight: 600 }}>{name}</span>
    </div>
  );
}

function RatingGenreLine({
  contentRating,
  genre,
  separator,
}: {
  contentRating: string | null;
  genre: string | null;
  separator: string;
}) {
  const parts: ReactNode[] = [];
  if (contentRating) {
    parts.push(
      <span key="rating" style={{ fontWeight: 700 }}>
        {contentRating}
      </span>,
    );
  }
  if (genre) {
    parts.push(<span key="genre">{genre}</span>);
  }
  if (parts.length === 0) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: "rgba(232,240,255,0.55)",
        textShadow: "0 1px 6px rgba(0,0,0,0.95)",
      }}
    >
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 ? separator : null}
          {part}
        </span>
      ))}
    </div>
  );
}
