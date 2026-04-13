# @chuzi/shared

Shared TypeScript types, realm configuration, and theme tokens for CHUZI apps.

## Contents

### Types (`@chuzi/shared/types`)

TypeScript interfaces matching the CHUZI API v1 responses:

- **Auth** — `LoginRequest`, `LoginResponse`
- **Catalog** — `StoryListItem`, `CatalogResponse`, `StoryPreview`, `StoryProgress`
- **Watch** — `SceneMapResponse`, `SceneMapEntry`, `SceneChoice`, `WatchSnapshot`
- **Bookmarks** — `BookmarkResponse`, `BookmarkListResponse`
- **User** — `UserProfile`, `UpdateRealmRequest`
- **Realm** — `RealmId`, `RealmDefinition`, `RealmConfigResponse`

### Config (`@chuzi/shared/config`)

Realm/lexicon constants ported from the CHUZI backend `config/chuzi_realms.php`:

- `REALMS` — full realm definitions with lexicons
- `FALLBACK_LEXICON` — neutral labels when no realm is chosen
- `t(realmId, key)` — lexicon lookup with fallback
- `lexiconForRealm(realmId)` — merged lexicon for a realm

### Themes (`@chuzi/shared/themes`)

Design tokens mirroring `chuzi-realms.css` and the scene tree viewer:

- `THEME_TOKENS` — CSS variable equivalents (bgDeep, accent, text, etc.)
- `SCENE_TREE_THEMES` — d3 scene tree colors, shapes, borders
- `getThemeTokens(realmId)` / `getSceneTreeTheme(realmId)` — lookup helpers

## Usage

```typescript
import { t, lexiconForRealm, getThemeTokens } from "@chuzi/shared";
import type { CatalogResponse, RealmId } from "@chuzi/shared";

const realm: RealmId = "cosmos";
console.log(t(realm, "story"));          // "Star System"
console.log(getThemeTokens(realm).accent); // "#7eb8ff"
```

## Build

```bash
npm install
npm run build      # Outputs to dist/
npm run typecheck   # Type-check only
```
