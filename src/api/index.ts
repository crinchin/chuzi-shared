import type {
  AcceptGenerationRequest,
  AcceptGenerationResponse,
  AiGenerationShowResponse,
  BookmarkListResponse,
  BookmarkResponse,
  CatalogResponse,
  CreateSceneActionRequest,
  CreateSceneRequest,
  CreateStoryRequest,
  EngagementResponse,
  GenerateImageRequest,
  GenerateImageResponse,
  LocaleId,
  MagicLinkRequest,
  MagicLinkRequestResponse,
  MagicLinkVerifyRequest,
  MagicLinkVerifyResponse,
  MediaItem,
  MineResponse,
  PaginatedResponse,
  PlayUrlResponse,
  PublicDirectorProfile,
  RealmConfigResponse,
  RegisterMediaRequest,
  RegisterMediaResponse,
  RejectGenerationRequest,
  RejectGenerationResponse,
  SaveBookmarkRequest,
  SceneActionItem,
  SceneListItem,
  SceneMapResponse,
  SourceUrlResponse,
  StoryListItem,
  StoryStyleResponse,
  TagListResponse,
  TrackEngagementRequest,
  TranscodeRequest,
  TranscodeResponse,
  UpdateLocaleRequest,
  UpdateLocaleResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateRealmRequest,
  UpdateRealmResponse,
  UpdateSceneActionRequest,
  UpdateSceneRequest,
  UpdateStoryRequest,
  UploadUrlRequest,
  UploadUrlResponse,
  UserProfile,
} from "../types/index.js";

/**
 * Token resolver returned by the host app. Called on every request; may be
 * synchronous (in-memory) or async (SecureStore on RN-tvOS, AsyncStorage on
 * RN). Return null when the user is unauthenticated.
 */
export type TokenResolver = () => string | null | Promise<string | null>;

export interface ChuziClientConfig {
  /** Base URL of the CHUZI API — no trailing slash required. */
  baseUrl: string;
  /** Returns the current bearer token, or null if unauthenticated. */
  getToken?: TokenResolver;
  /** Override fetch for testing or RN polyfills. Defaults to globalThis.fetch. */
  fetch?: typeof fetch;
  /** Sent as User-Agent (web), or X-Client header (RN). Optional. */
  client?: string;
}

export class ChuziApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `chuzi-api ${status}`);
    this.name = "ChuziApiError";
  }
}

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildQuery(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

function makeRequester(config: ChuziClientConfig) {
  const fetchFn = config.fetch ?? globalThis.fetch;
  const baseUrl = config.baseUrl.replace(/\/+$/, "");

  return async function request<T>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (config.client) headers["X-Chuzi-Client"] = config.client;
    if (config.getToken) {
      const token = await config.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetchFn(`${baseUrl}${path}${buildQuery(opts.query)}`, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });

    if (res.status === 204) return undefined as T;

    let parsed: unknown = null;
    const text = await res.text();
    if (text.length > 0) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!res.ok) {
      throw new ChuziApiError(res.status, parsed);
    }
    return parsed as T;
  };
}

export interface ChuziClient {
  auth: {
    requestMagicLink(req: MagicLinkRequest): Promise<MagicLinkRequestResponse>;
    verifyMagicLink(req: MagicLinkVerifyRequest): Promise<MagicLinkVerifyResponse>;
    logout(): Promise<void>;
    user(): Promise<UserProfile>;
  };
  catalog: {
    index(opts?: { signal?: AbortSignal }): Promise<CatalogResponse>;
    byCreator(userId: string, opts?: { signal?: AbortSignal }): Promise<CatalogResponse>;
  };
  config: {
    realms(opts?: { locale?: LocaleId; signal?: AbortSignal }): Promise<RealmConfigResponse>;
  };
  stories: {
    index(opts?: { signal?: AbortSignal }): Promise<PaginatedResponse<StoryListItem>>;
    show(id: string, opts?: { signal?: AbortSignal }): Promise<StoryListItem>;
    mine(opts?: { signal?: AbortSignal }): Promise<MineResponse>;
    create(req: CreateStoryRequest): Promise<{ data: StoryListItem }>;
    update(id: string, req: UpdateStoryRequest): Promise<{ data: StoryListItem }>;
    destroy(id: string): Promise<void>;
  };
  tags: {
    index(opts?: { signal?: AbortSignal }): Promise<TagListResponse>;
  };
  scenes: {
    index(storyId: string, opts?: { signal?: AbortSignal }): Promise<SceneListItem[]>;
    show(id: string, opts?: { signal?: AbortSignal }): Promise<SceneListItem>;
    create(req: CreateSceneRequest): Promise<SceneListItem>;
    update(id: string, req: UpdateSceneRequest): Promise<SceneListItem>;
    destroy(id: string): Promise<void>;
  };
  sceneActions: {
    index(opts?: {
      sceneId?: string;
      signal?: AbortSignal;
    }): Promise<SceneActionItem[]>;
    show(id: string, opts?: { signal?: AbortSignal }): Promise<SceneActionItem>;
    create(req: CreateSceneActionRequest): Promise<SceneActionItem>;
    update(id: string, req: UpdateSceneActionRequest): Promise<SceneActionItem>;
    destroy(id: string): Promise<{ message: string }>;
  };
  media: {
    uploadUrl(req: UploadUrlRequest): Promise<UploadUrlResponse>;
    register(req: RegisterMediaRequest): Promise<RegisterMediaResponse>;
    transcode(req: TranscodeRequest): Promise<TranscodeResponse>;
    playUrl(id: string, opts?: { signal?: AbortSignal }): Promise<PlayUrlResponse>;
    sourceUrl(id: string, opts?: { signal?: AbortSignal }): Promise<SourceUrlResponse>;
  };
  watch: {
    sceneMap(storyId: string, opts?: { signal?: AbortSignal }): Promise<SceneMapResponse>;
    trackEngagement(storyId: string, req: TrackEngagementRequest): Promise<EngagementResponse>;
    saveBookmark(storyId: string, req: SaveBookmarkRequest): Promise<BookmarkResponse>;
    listBookmarks(storyId: string, opts?: { signal?: AbortSignal }): Promise<BookmarkListResponse>;
  };
  user: {
    profile(opts?: { signal?: AbortSignal }): Promise<UserProfile>;
    publicProfile(userId: string, opts?: { signal?: AbortSignal }): Promise<PublicDirectorProfile>;
    updateRealm(req: UpdateRealmRequest): Promise<UpdateRealmResponse>;
    updateLocale(req: UpdateLocaleRequest): Promise<UpdateLocaleResponse>;
    updateProfile(req: UpdateProfileRequest): Promise<UpdateProfileResponse>;
  };
  credits: {
    balance(opts?: { signal?: AbortSignal }): Promise<{ balance: number }>;
    ledger(opts?: {
      signal?: AbortSignal;
      cursor?: string;
      limit?: number;
    }): Promise<{ data: unknown[]; next_cursor: string | null }>;
    packs(opts?: { signal?: AbortSignal }): Promise<{ data: unknown[] }>;
  };
  ai: {
    generateImage(req: GenerateImageRequest): Promise<GenerateImageResponse>;
    show(id: string, opts?: { signal?: AbortSignal }): Promise<AiGenerationShowResponse>;
    accept(id: string, req: AcceptGenerationRequest): Promise<AcceptGenerationResponse>;
    reject(id: string, req: RejectGenerationRequest): Promise<RejectGenerationResponse>;
    storyStyle(storyId: string, opts?: { signal?: AbortSignal }): Promise<StoryStyleResponse>;
  };
}

/**
 * Construct a typed CHUZI API client. Bearer-token auth via Authorization
 * header (works for web/SPA and native apps). The host owns token storage
 * and lifecycle — pass `getToken` to plug in localStorage / AsyncStorage /
 * SecureStore as appropriate.
 *
 * Surfaces not yet wired: scene-actions, exports, admin, reports.
 * Add them here as the migration reaches each surface; the route shapes
 * are documented in chuzi-api/routes/api.php.
 */
export function createChuziClient(config: ChuziClientConfig): ChuziClient {
  const request = makeRequester(config);

  return {
    auth: {
      requestMagicLink: (req) =>
        request("POST", "/api/v1/auth/magic-link/request", { body: req }),
      verifyMagicLink: (req) =>
        request("POST", "/api/v1/auth/magic-link/verify", { body: req }),
      logout: () => request("POST", "/api/v1/auth/logout"),
      user: () => request("GET", "/api/v1/auth/user"),
    },
    catalog: {
      index: (opts) => request("GET", "/api/v1/catalog", opts),
      byCreator: (userId, opts) =>
        request("GET", "/api/v1/catalog", {
          signal: opts?.signal,
          query: { creator_id: userId },
        }),
    },
    config: {
      realms: (opts) =>
        request("GET", "/api/v1/config/realms", {
          signal: opts?.signal,
          query: opts?.locale ? { locale: opts.locale } : undefined,
        }),
    },
    stories: {
      index: (opts) => request("GET", "/api/v1/stories", opts),
      show: (id, opts) => request("GET", `/api/v1/stories/${encodeURIComponent(id)}`, opts),
      mine: (opts) => request("GET", "/api/v1/stories/mine", opts),
      create: (req) => request("POST", "/api/v1/stories", { body: req }),
      update: (id, req) => request("PATCH", `/api/v1/stories/${encodeURIComponent(id)}`, { body: req }),
      destroy: (id) => request("DELETE", `/api/v1/stories/${encodeURIComponent(id)}`),
    },
    tags: {
      index: (opts) => request("GET", "/api/v1/tags", opts),
    },
    scenes: {
      index: (storyId, opts) =>
        request("GET", "/api/v1/scenes", {
          signal: opts?.signal,
          query: { story_id: storyId },
        }),
      show: (id, opts) =>
        request("GET", `/api/v1/scenes/${encodeURIComponent(id)}`, opts),
      create: (req) =>
        request("POST", "/api/v1/scenes", { body: req }),
      update: (id, req) =>
        request("PATCH", `/api/v1/scenes/${encodeURIComponent(id)}`, { body: req }),
      destroy: (id) =>
        request("DELETE", `/api/v1/scenes/${encodeURIComponent(id)}`),
    },
    sceneActions: {
      index: (opts) =>
        request("GET", "/api/v1/scene-actions", {
          signal: opts?.signal,
          query: opts?.sceneId ? { scene_id: opts.sceneId } : undefined,
        }),
      show: (id, opts) =>
        request("GET", `/api/v1/scene-actions/${encodeURIComponent(id)}`, opts),
      create: (req) =>
        request("POST", "/api/v1/scene-actions", { body: req }),
      update: (id, req) =>
        request("PATCH", `/api/v1/scene-actions/${encodeURIComponent(id)}`, {
          body: req,
        }),
      destroy: (id) =>
        request("DELETE", `/api/v1/scene-actions/${encodeURIComponent(id)}`),
    },
    media: {
      uploadUrl: (req) =>
        request("POST", "/api/v1/media/upload-url", { body: req }),
      register: (req) =>
        request("POST", "/api/v1/media/register", { body: req }),
      transcode: (req) =>
        request("POST", "/api/v1/media/transcode", { body: req }),
      playUrl: (id, opts) =>
        request("GET", `/api/v1/media/${encodeURIComponent(id)}/play`, opts),
      sourceUrl: (id, opts) =>
        request("GET", `/api/v1/media/${encodeURIComponent(id)}/source-url`, opts),
    },
    watch: {
      sceneMap: (storyId, opts) =>
        request("GET", `/api/v1/stories/${encodeURIComponent(storyId)}/scene-map`, opts),
      trackEngagement: (storyId, req) =>
        request("POST", `/api/v1/stories/${encodeURIComponent(storyId)}/engagement`, { body: req }),
      saveBookmark: (storyId, req) =>
        request("POST", `/api/v1/stories/${encodeURIComponent(storyId)}/bookmark`, { body: req }),
      listBookmarks: (storyId, opts) =>
        request("GET", `/api/v1/stories/${encodeURIComponent(storyId)}/bookmarks`, opts),
    },
    user: {
      profile: (opts) => request("GET", "/api/v1/user/profile", opts),
      publicProfile: (userId, opts) =>
        request("GET", `/api/v1/users/${encodeURIComponent(userId)}/public`, opts),
      updateRealm: (req) => request("PUT", "/api/v1/user/realm", { body: req }),
      updateLocale: (req) => request("PUT", "/api/v1/user/locale", { body: req }),
      updateProfile: (req) => request("PUT", "/api/v1/user/profile", { body: req }),
    },
    credits: {
      balance: (opts) => request("GET", "/api/v1/credits/balance", opts),
      ledger: (opts) =>
        request("GET", "/api/v1/credits/ledger", {
          signal: opts?.signal,
          query: { cursor: opts?.cursor, limit: opts?.limit },
        }),
      packs: (opts) => request("GET", "/api/v1/credits/packs", opts),
    },
    ai: {
      generateImage: (req) =>
        request("POST", "/api/v1/ai/generate-image", { body: req }),
      show: (id, opts) =>
        request("GET", `/api/v1/ai/generations/${encodeURIComponent(id)}`, opts),
      accept: (id, req) =>
        request("POST", `/api/v1/ai/generations/${encodeURIComponent(id)}/accept`, { body: req }),
      reject: (id, req) =>
        request("POST", `/api/v1/ai/generations/${encodeURIComponent(id)}/reject`, { body: req }),
      storyStyle: (storyId, opts) =>
        request("GET", `/api/v1/ai/stories/${encodeURIComponent(storyId)}/style`, opts),
    },
  };
}
