import type { RealmId } from "../types/index.js";

/**
 * CSS custom property tokens, mirroring public/css/chuzi-realms.css.
 * Use these for any non-DOM rendering (e.g. React Native, canvas).
 */
export interface RealmThemeTokens {
  bgDeep: string;
  bgMid: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
}

export const THEME_TOKENS: Record<RealmId, RealmThemeTokens> = {
  cosmos: {
    bgDeep: "#04070d",
    bgMid: "#0a1020",
    accent: "#7eb8ff",
    accentSoft: "rgba(126, 184, 255, 0.35)",
    text: "#e8f0ff",
    muted: "rgba(232, 240, 255, 0.65)",
  },
  wilds: {
    bgDeep: "#0d120c",
    bgMid: "#152018",
    accent: "#7bc96f",
    accentSoft: "rgba(123, 201, 111, 0.35)",
    text: "#eef6ea",
    muted: "rgba(238, 246, 234, 0.7)",
  },
};

/**
 * Scene tree visualization theme, mirroring the THEMES object in
 * resources/js/scene-tree-viewer.js.
 */
export interface SceneTreeTheme {
  bg: string;
  edgeChoice: string;
  edgeGoto: string;
  nodeDefault: string;
  nodeActive: string;
  borderDefault: string;
  borderActive: string;
  labelDefault: string;
  labelActive: string;
  nodeLockedFill: string;
  nodeLockedBorder: string;
  labelLocked: string;
  nodeShape: "star" | "rect";
  rectRx: number;
}

export const SCENE_TREE_THEMES: Record<RealmId, SceneTreeTheme> = {
  cosmos: {
    bg: "#020408",
    edgeChoice: "#e8f0ff",
    edgeGoto: "#4a9fff",
    nodeDefault: "#ffffff",
    nodeActive: "#ffd47e",
    borderDefault: "#3a5080",
    borderActive: "#fff6d0",
    labelDefault: "rgba(220, 232, 255, 0.92)",
    labelActive: "rgba(255, 246, 220, 0.98)",
    nodeLockedFill: "#151a28",
    nodeLockedBorder: "#2a3348",
    labelLocked: "rgba(200, 210, 230, 0.35)",
    nodeShape: "star",
    rectRx: 2,
  },
  wilds: {
    bg: "#04070d",
    edgeChoice: "#ffffff",
    edgeGoto: "#6ecf7a",
    nodeDefault: "#e8f5e4",
    nodeActive: "#d31e2f",
    borderDefault: "#2d4a32",
    borderActive: "#ff9ea8",
    labelDefault: "rgba(232, 245, 228, 0.92)",
    labelActive: "rgba(255, 214, 219, 0.98)",
    nodeLockedFill: "#1a221c",
    nodeLockedBorder: "#2a3d30",
    labelLocked: "rgba(200, 220, 200, 0.38)",
    nodeShape: "rect",
    rectRx: 3,
  },
};

/**
 * Get theme tokens for a realm, defaulting to wilds.
 */
export function getThemeTokens(realmId: RealmId | null | undefined): RealmThemeTokens {
  return THEME_TOKENS[realmId ?? "wilds"] ?? THEME_TOKENS.wilds;
}

/**
 * Get scene tree theme for a realm, defaulting to wilds.
 */
export function getSceneTreeTheme(realmId: RealmId | null | undefined): SceneTreeTheme {
  return SCENE_TREE_THEMES[realmId ?? "wilds"] ?? SCENE_TREE_THEMES.wilds;
}
