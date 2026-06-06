import type { SceneChoice, SceneListItem, TextLine } from "./types/index.js";

/** Playhead position where timed content is fully visible (after fade-in). */
export function previewMsWhenVisible(timing: {
  appear_at_ms: number;
  fade_in_ms: number;
}): number {
  return timing.appear_at_ms + timing.fade_in_ms;
}

export interface ChoiceTiming {
  appear_at_ms: number;
  fade_in_ms: number;
  duration_ms: number;
  fade_out_ms: number;
}

export function resolveChoiceTiming(
  choice: SceneChoice,
  fallbackAppearMs: number,
): ChoiceTiming {
  const appearMs =
    choice.start_time_seconds != null
      ? Math.round(choice.start_time_seconds * 1000)
      : fallbackAppearMs;
  const fadeIn = choice.fade_in_ms ?? 400;
  const fadeOut = choice.fade_out_ms ?? 400;
  const endMs =
    choice.end_time_seconds != null
      ? Math.round(choice.end_time_seconds * 1000)
      : appearMs + fadeIn + (choice.duration_ms ?? 2000) + fadeOut;
  const duration =
    choice.duration_ms ?? Math.max(500, endMs - appearMs - fadeIn - fadeOut);
  return {
    appear_at_ms: appearMs,
    fade_in_ms: fadeIn,
    duration_ms: duration,
    fade_out_ms: fadeOut,
  };
}

function lineHasVisiblePayload(line: TextLine): boolean {
  if (line.type === "sound" || line.type === "image") {
    return Boolean(line.media_id);
  }
  return line.html.replace(/<[^>]*>/g, "").trim().length > 0;
}

function fallbackAppearMsFromLines(lines: TextLine[]): number {
  if (lines.length === 0) return 0;
  const last = lines[lines.length - 1];
  return previewMsWhenVisible(last) + last.duration_ms;
}

/**
 * Pick the playhead instant where the most scene content is on screen —
 * text lines, choices, and other timed elements at full opacity.
 */
export function computeScenePreviewMs(
  scene: SceneListItem,
  choices: SceneChoice[],
  textLines: TextLine[],
): number {
  const fallback = fallbackAppearMsFromLines(textLines);
  const candidates: number[] = [0];

  for (const line of textLines) {
    if (lineHasVisiblePayload(line)) {
      candidates.push(previewMsWhenVisible(line));
    }
  }

  for (const choice of choices) {
    if (choice.label.trim().length > 0 || choice.target_scene_id) {
      candidates.push(previewMsWhenVisible(resolveChoiceTiming(choice, fallback)));
    }
  }

  return Math.max(...candidates);
}

export function isLikelyImageUrl(url: string, mediaType?: string | null): boolean {
  if (mediaType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url);
}

export function isLikelyVideoUrl(url: string, mediaType?: string | null): boolean {
  if (mediaType?.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url);
}
