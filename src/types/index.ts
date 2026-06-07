// ── Auth ──

export interface MagicLinkRequest {
  email: string;
  username?: string;
  device_name?: string;
}

export interface MagicLinkRequestResponse {
  message: string;
}

export interface MagicLinkVerifyRequest {
  email: string;
  token: string;
  device_name?: string;
}

export interface MagicLinkVerifyResponse {
  token?: string;
  user: UserProfile;
}

export interface OidcExchangeRequest {
  code: string;
  code_verifier: string;
  redirect_uri: string;
  device_name?: string;
}

export interface OidcExchangeResponse {
  token?: string;
  user: UserProfile;
}

export interface PasswordLoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface PasswordLoginResponse {
  token?: string;
  user: UserProfile;
}

// ── User ──

export interface UserProfile {
  id: string;
  name: string;
  username: string;
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
  username?: string;
}

export interface UpdateProfileResponse {
  user: UserProfile;
}

export interface UsernameAvailabilityResponse {
  username: string;
  available: boolean;
  suggestion?: string;
}

export interface PublicDirectorProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  realm: RealmId | null;
  stories_count: number;
}

// ── Credits & payments ──

export type CreditPool = "watch" | "create";

export interface CreditBalance {
  watch: number;
  create: number;
}

export interface CreditPack {
  id: string;
  pool: CreditPool;
  name: string;
  credits: number;
  price_cents: number;
  price: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  label: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CreditBalanceResponse {
  balance: CreditBalance;
}

export interface UploadCostResponse {
  file_size_bytes: number;
  file_size_mb: number;
  base_size_mb: number;
  credits_needed: number;
  balance: CreditBalance;
  can_afford: boolean;
}

export interface PurchaseCreditsRequest {
  pack_id: string;
  payment_method_id?: string;
}

export interface PurchaseAmountRequest {
  pool: CreditPool;
  credits: number;
  payment_method_id?: string;
}

export interface PurchaseCreditsResponse {
  message: string;
  transaction_id?: string;
  balance: CreditBalance;
}

export interface StorePaymentMethodRequest {
  type?: string;
  last_four: string;
  label?: string;
}

export interface GrantCreditsRequest {
  user_id: string;
  pool: CreditPool;
  amount: number;
  note?: string;
}

export interface GrantCreditsResponse {
  message: string;
  balance: CreditBalance;
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
  tags: string[];
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

export interface MineResponse {
  stories: StoryListItem[];
  data?: StoryListItem[];
  progress?: Record<string, StoryProgress>;
  meta: {
    coverboxes: Record<string, string | null>;
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
  arrow_rotation: number;
  arrow_scale: number;
  fade_in_ms?: number | null;
  fade_out_ms?: number | null;
  duration_ms?: number | null;
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

export type SceneActionPayload = Record<string, unknown> | unknown[];

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

export type LineType = "text" | "sound" | "image";

export interface TextLine {
  id: string;
  type?: LineType;
  media_id?: string;
  html: string;
  appear_at_ms: number;
  fade_in_ms: number;
  fade_out_ms: number;
  duration_ms: number;
  position_x?: number;
  position_y?: number;
  width_pct?: number;
  height_pct?: number;
  persist?: boolean;
}

export interface SceneTextContent {
  html: string;
  lines?: TextLine[];
}

export interface SceneListItem {
  id: string;
  story_id: string;
  title: string;
  order: number;
  is_title: boolean;
  is_end: boolean;
  color: string | null;
  media_id: string | null;
  alt_media_id: string | null;
  media_mode: "text" | "imagery" | "film" | null;
  text_content: SceneTextContent | null;
  text_style: {
    font_family?: string | null;
    text_color?: string | null;
    background_color?: string | null;
  } | null;
  goto_scene_id?: string | null;
  choice_end_time_seconds?: number | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateSceneRequest {
  title?: string;
  order?: number;
  media_id?: string | null;
  alt_media_id?: string | null;
  media_mode?: "text" | "imagery" | "film" | null;
  text_content?: SceneTextContent | null;
  text_style?: {
    font_family?: string | null;
    text_color?: string | null;
    background_color?: string | null;
  } | null;
  color?: string | null;
  is_title?: boolean;
  is_end?: boolean;
  goto_scene_id?: string | null;
  choice_style?: string | null;
  choice_overlay_mode?: string | null;
  choice_reveal_mode?: string | null;
  choice_start_time_seconds?: number | null;
  choice_pause_for_choice?: boolean;
  choice_end_time_seconds?: number | null;
}

export interface CreateSceneRequest {
  story_id: string;
  title: string;
  order?: number;
  is_title?: boolean;
  is_end?: boolean;
}

export interface SceneActionItem {
  id: string;
  scene_id: string;
  name: string;
  type: string | null;
  scene_choice_id: string | null;
  order: number;
  duration: number;
  properties: SceneActionPayload | null;
  subproperties: SceneActionPayload | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSceneActionRequest {
  scene_id: string;
  name: string;
  type?: string | null;
  order?: number;
  duration?: number;
  properties?: SceneActionPayload | null;
  subproperties?: SceneActionPayload | null;
}

export interface UpdateSceneActionRequest {
  name?: string;
  type?: string | null;
  order?: number;
  duration?: number;
  properties?: SceneActionPayload;
  subproperties?: SceneActionPayload;
}

// ── AI Generation ──

export type AiGenerationStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed"
  | "accepted"
  | "rejected";

export interface GenerateImageRequest {
  story_id: string;
  scene_id?: string;
  prompt: string;
  mood?: string;
  visual_style?: string;
  rejection_feedback?: string;
  previous_generation_id?: string;
}

export interface AiGeneration {
  id: string;
  story_id: string;
  scene_id: string | null;
  status: AiGenerationStatus;
  user_prompt: string;
  style_context: {
    mood?: string;
    visual_style?: string;
    subject_prompt: string;
    full_prompt: string;
    negative_prompt?: string;
  };
  preview_url?: string;
  rejection_feedback: string | null;
  media_id: string | null;
  attempt_number: number;
  credits_charged: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateImageResponse {
  generation: AiGeneration;
  balance: { watch: number; create: number };
}

export interface AiGenerationShowResponse {
  generation: AiGeneration;
}

export interface AcceptGenerationRequest {
  scene_id: string;
}

export interface AcceptGenerationResponse {
  generation: AiGeneration;
  scene: SceneListItem;
  media: MediaItem;
}

export interface RejectGenerationRequest {
  feedback: string;
}

export interface RejectGenerationResponse {
  generation: AiGeneration;
}

export interface StoryStyleResponse {
  has_style: boolean;
  style_context: AiGeneration["style_context"] | null;
}

// ── Media ──

export interface MediaItem {
  id: string;
  user_id: string;
  s3_key: string;
  source_path: string;
  output_prefix: string | null;
  status: "uploaded" | "processing" | "ready" | "error";
  meta: Record<string, unknown>;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
}

export interface UploadUrlResponse {
  key: string;
  uploadUrl: string;
}

export interface RegisterMediaRequest {
  key: string;
  s3_key: string;
  filename: string;
  content_type?: string;
  title?: string;
  file_size?: number;
}

export interface RegisterMediaResponse extends MediaItem {
  credits_charged: number;
  balance: number;
}

export interface TranscodeRequest {
  media_id: string;
}

export interface TranscodeResponse {
  message: string;
  job_id: string | null;
  manifest_path?: string;
}

export interface PlayUrlResponse {
  play_url: string;
  status: string;
}

export interface SourceUrlResponse {
  url: string;
}

// ── Story authoring ──

export interface CreateStoryRequest {
  title: string;
  description?: string | null;
  genre?: string | null;
  content_rating?: ContentRating | null;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string | null;
  genre?: string | null;
  content_rating?: ContentRating | null;
  published?: boolean;
  tags?: string[];
}

export interface TagListResponse {
  data: string[];
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

// ── Scene Visibility ──

export interface SceneVisibility {
  /** Whether the user can navigate to this scene-star. */
  navigable: boolean;
  /** Whether the star/edge should render at reduced opacity. */
  dimmed: boolean;
}

/**
 * Compute per-scene navigable/dimmed flags for a constellation.
 *
 * Rules:
 * - If `isCreator` is true, everything is navigable and bright.
 * - Title scenes are always navigable and bright.
 * - If the user has watched the ending (`endingSeen`), all scenes unlock.
 * - Otherwise non-title scenes are locked and dimmed.
 */
export function computeSceneVisibility(
  sceneList: Pick<SceneListItem, "is_title" | "is_end">[],
  opts: { isCreator: boolean; endingSeen: boolean },
): SceneVisibility[] {
  if (opts.isCreator || opts.endingSeen) {
    return sceneList.map(() => ({ navigable: true, dimmed: false }));
  }
  return sceneList.map((scene) => ({
    navigable: scene.is_title,
    dimmed: !scene.is_title,
  }));
}
