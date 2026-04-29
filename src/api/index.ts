import type {
  BookmarkListResponse,
  BookmarkResponse,
  CatalogResponse,
  CreateStoryRequest,
  EngagementResponse,
  LocaleId,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  RealmConfigResponse,
  SaveBookmarkRequest,
  SceneMapResponse,
  StoryListItem,
  TrackEngagementRequest,
  UpdateLocaleRequest,
  UpdateLocaleResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateRealmRequest,
  UpdateRealmResponse,
  UserProfile,
} from "../types/index.js";

/**
 * Token resolver returned by the host app. Called on every request; may be
 * synchronous (in-memory) or async (SecureStore on RN-tvOS, AsyncStorage on
 * RN). Return null when the user is unauthenticated.
 */
export type TokenResolver = () => string | null | Promise<string | null>;

export interface ChuziClientConfig {
  /** e.g. "https://api.dev.chuzi.app" — no trailing slash required. */
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
    login(req: LoginRequest): Promise<LoginResponse>;
    register(req: LoginRequest & { name: string }): Promise<LoginResponse>;
    logout(): Promise<void>;
    forgotPassword(req: { email: string }): Promise<{ status: string }>;
    resetPassword(req: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }): Promise<{ status: string }>;
    user(): Promise<UserProfile>;
  };
  catalog: {
    index(opts?: { signal?: AbortSignal }): Promise<CatalogResponse>;
  };
  config: {
    realms(opts?: { locale?: LocaleId; signal?: AbortSignal }): Promise<RealmConfigResponse>;
  };
  stories: {
    index(opts?: { signal?: AbortSignal }): Promise<PaginatedResponse<StoryListItem>>;
    show(id: string, opts?: { signal?: AbortSignal }): Promise<StoryListItem>;
    mine(opts?: { signal?: AbortSignal }): Promise<PaginatedResponse<StoryListItem>>;
    create(req: CreateStoryRequest): Promise<{ data: StoryListItem }>;
  };
  watch: {
    sceneMap(storyId: string, opts?: { signal?: AbortSignal }): Promise<SceneMapResponse>;
    trackEngagement(storyId: string, req: TrackEngagementRequest): Promise<EngagementResponse>;
    saveBookmark(storyId: string, req: SaveBookmarkRequest): Promise<BookmarkResponse>;
    listBookmarks(storyId: string, opts?: { signal?: AbortSignal }): Promise<BookmarkListResponse>;
  };
  user: {
    profile(opts?: { signal?: AbortSignal }): Promise<UserProfile>;
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
}

/**
 * Construct a typed CHUZI API client. Bearer-token auth via Authorization
 * header (works for web/SPA and native apps). The host owns token storage
 * and lifecycle — pass `getToken` to plug in localStorage / AsyncStorage /
 * SecureStore as appropriate.
 *
 * Surfaces not yet wired: scenes, scene-actions, media, exports, admin,
 * reports. Add them here as the migration reaches each surface; the route
 * shapes are documented in chuzi-api/routes/api.php.
 */
export function createChuziClient(config: ChuziClientConfig): ChuziClient {
  const request = makeRequester(config);

  return {
    auth: {
      login: (req) => request("POST", "/api/v1/auth/login", { body: req }),
      register: (req) => request("POST", "/api/v1/auth/register", { body: req }),
      logout: () => request("POST", "/api/v1/auth/logout"),
      forgotPassword: (req) => request("POST", "/api/v1/auth/forgot-password", { body: req }),
      resetPassword: (req) => request("POST", "/api/v1/auth/reset-password", { body: req }),
      user: () => request("GET", "/api/v1/auth/user"),
    },
    catalog: {
      index: (opts) => request("GET", "/api/v1/catalog", opts),
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
  };
}
