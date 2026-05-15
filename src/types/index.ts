// ── Auth ──

export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

// ── User ──

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  realm: RealmId | null;
  needs_realm_choice: boolean;
  locale: LocaleId | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface UpdateRealmRequest {
  realm: RealmId;
}

export interface UpdateRealmResponse {
  realm: RealmId;
  user: UserProfile;
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface UpdateProfileResponse {
  user: UserProfile;
}

// ── Catalog ──

export interface StoryListItem {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  content_rating: ContentRating | null;
  published: boolean;
  published_version: number;
  watch_starts_count: number;
  choice_clicks_count: number;
  scenes_count: number;
  choices_count: number;
  creator: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface StoryPreview {
  source: "trailer" | "title_scene" | "none";
  title: string;
  preview_url: string | null;
  media_type: string | null;
  is_ready: boolean;
}

export interface PopularChoice {
  label: string;
  click_count: number;
}

export interface StoryProgress {
  last_scene_id: string | null;
  bookmark_code: string | null;
  playback_seconds: number;
  watched_version: number;
  last_watched_at: string | null;
}

export interface CatalogResponse {
  data: StoryListItem[];
  meta: {
    previews: Record<string, StoryPreview>;
    popular_choices: Record<string, PopularChoice[]>;
    creator_avatars: Record<string, string>;
    coverboxes: Record<string, string | null>;
    progress: Record<string, StoryProgress>;
  };
}

// ── Watch / Scene Map ──

export interface SceneChoice {
  id: string;
  label: string;
  choice_type: string;
  choice_icon: string | null;
  choice_icon_media_id: string | null;
  choice_icon_url: string | null;
  reveal_mode: string;
  start_time_seconds: number | null;
  pause_for_choice: boolean;
  end_time_seconds: number | null;
  target_scene_id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visibility_rules: VisibilityRules | null;
  state_updates: StateUpdate[];
}

export interface VisibilityRules {
  mode: "all" | "any";
  conditions: VisibilityCondition[];
}

export interface VisibilityCondition {
  variable?: string;
  key?: string;
  operator?: string;
  value?: string;
}

export interface StateUpdate {
  variable?: string;
  key?: string;
  action?: string;
  value?: string;
}

export interface SceneNode {
  type: string;
  properties?: Record<string, unknown>;
  children?: SceneNode[];
}

export interface SceneMapEntry {
  scene_id: string;
  scene_title: string;
  color: string | null;
  is_title: boolean;
  media_title: string | null;
  media_type: string | null;
  media_url: string | null;
  stream_status: string | null;
  choice_style: string;
  choice_overlay_mode: string;
  goto_scene_id: string | null;
  choices: SceneChoice[];
  nodes: SceneNode[];
}

export interface TreeGraphNode {
  id: string;
  title: string;
  is_title: boolean;
  is_end: boolean;
  level: number;
  index: number;
  x: number;
  y: number;
  color: string | null;
}

export interface TreeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: "choice" | "go_to_scene";
}

export interface TreeGraph {
  nodes: TreeGraphNode[];
  edges: TreeGraphEdge[];
  meta: {
    root_id: string | null;
    level_count: number;
  };
}

export interface WatchSnapshot {
  scene_id: string | null;
  state: Record<string, string>;
  history: HistoryEntry[];
  path: string[];
  visited_scene_ids?: string[];
  playback_seconds: number;
}

export interface HistoryEntry {
  choice_id: string;
  scene_id: string;
  target_scene_id: string | null;
  at: string | null;
  path_index: number | null;
}

export interface SceneMapResponse {
  story: {
    id: string;
    title: string;
    description: string | null;
    genre: string | null;
    content_rating: ContentRating | null;
    published_version: number;
    watch_starts_count: number;
    choice_clicks_count: number;
  };
  start_scene_id: string;
  scene_map: Record<string, SceneMapEntry>;
  tree_graph: TreeGraph;
  initial_snapshot: WatchSnapshot;
  initial_bookmark_code: string | null;
}

// ── Engagement ──

export interface TrackEngagementRequest {
  event: "play_start" | "choice_click";
  choice_id?: string;
}

export interface EngagementResponse {
  watch_starts_count: number;
  choice_clicks_count: number;
}

// ── Bookmarks ──

export interface SaveBookmarkRequest {
  snapshot: WatchSnapshot;
}

export interface BookmarkResponse {
  code: string;
  snapshot: WatchSnapshot;
}

export interface BookmarkListItem {
  code: string;
  snapshot: WatchSnapshot;
  updated_at: string;
}

export interface BookmarkListResponse {
  bookmarks: BookmarkListItem[];
}

// ── Pagination ──

export interface PaginatedLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginatedLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// ── Scenes ──

export interface SceneListItem {
  id: string;
  story_id: string;
  title: string;
  order: number;
  is_title: boolean;
  is_end: boolean;
  color: string | null;
  media_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Story authoring ──

export interface CreateStoryRequest {
  title: string;
  description?: string | null;
  genre?: string | null;
  content_rating?: ContentRating | null;
}

// ── Content Ratings ──

export type ContentRating = "G" | "PG" | "PG-13" | "R" | "NC-17";

export interface ContentRatingDefinition {
  id: ContentRating;
  label: string;
  description: string;
}

// ── Realm Config ──

export type RealmId = "cosmos" | "wilds";

/** Supported UI locales — matches PHP `chuzi_realms.supported_locales`. */
export type LocaleId = "en" | "es" | "fr" | "de" | "pt";

export interface RealmDefinition {
  label: string;
  short_label: string;
  /** Canonical English lexicon (always present). */
  lexicon: Record<string, string>;
  /** Optional per-locale overrides; missing keys fall through to `lexicon`. */
  locales?: Partial<Record<LocaleId, Record<string, string>>>;
}

export interface RealmConfigResponse {
  realms: Record<RealmId, RealmDefinition>;
  fallback_lexicon: Record<string, string>;
  fallback_locales?: Partial<Record<LocaleId, Record<string, string>>>;
  intro: {
    line1: string;
    line2: string;
  };
  intro_locales?: Partial<Record<LocaleId, { line1: string; line2: string }>>;
  profile: {
    title: string;
    current_prefix: string;
    switch_prompt: string;
  };
  profile_locales?: Partial<Record<LocaleId, { title: string; current_prefix: string; switch_prompt: string }>>;
  allowed_realm_ids: RealmId[];
  supported_locales: LocaleId[];
  locale_labels?: Partial<Record<LocaleId, string>>;
}

export interface UpdateLocaleRequest {
  locale: LocaleId;
}

export interface UpdateLocaleResponse {
  locale: LocaleId;
}
