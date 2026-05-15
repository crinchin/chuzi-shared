import type {
  RealmId,
  RealmDefinition,
  ContentRating,
  ContentRatingDefinition,
  LocaleId,
} from "../types/index.js";

export const REALM_IDS: readonly RealmId[] = ["cosmos", "wilds"] as const;

export const SUPPORTED_LOCALES: readonly LocaleId[] = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
] as const;

export const LOCALE_LABELS: Record<LocaleId, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
};

export const DEFAULT_LOCALE: LocaleId = "en";

export function isSupportedLocale(value: unknown): value is LocaleId {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(value as LocaleId)
  );
}

/**
 * Normalize a raw locale tag (e.g. "en-US", "pt_BR") to a supported LocaleId,
 * matching the PHP `LocaleResolver::normalize` behavior.
 */
export function normalizeLocale(value: string | null | undefined): LocaleId | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  if (isSupportedLocale(lower)) return lower;
  const base = lower.split(/[-_]/, 1)[0];
  return isSupportedLocale(base) ? base : null;
}

/**
 * Pick the best supported locale from a browser Accept-Language string.
 * Mirrors PHP `LocaleResolver::matchAcceptLanguage` (q-value aware).
 */
export function matchAcceptLanguage(
  accept: string | null | undefined
): LocaleId | null {
  if (!accept) return null;
  const tags = accept
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.split("=")[1]) || 0 : 1;
      return { tag: tag.trim(), q };
    })
    .filter((c) => c.tag && c.tag !== "*")
    .sort((a, b) => b.q - a.q);

  for (const c of tags) {
    const normalized = normalizeLocale(c.tag);
    if (normalized) return normalized;
  }
  return null;
}

export const CONTENT_RATING_IDS: readonly ContentRating[] = [
  "G",
  "PG",
  "PG-13",
  "R",
  "NC-17",
] as const;

export const CONTENT_RATINGS: Record<ContentRating, ContentRatingDefinition> = {
  G: {
    id: "G",
    label: "G",
    description: "General Audiences — all ages admitted.",
  },
  PG: {
    id: "PG",
    label: "PG",
    description: "Parental Guidance Suggested — some material may not be suitable for children.",
  },
  "PG-13": {
    id: "PG-13",
    label: "PG-13",
    description: "Parents Strongly Cautioned — some material may be inappropriate for children under 13.",
  },
  R: {
    id: "R",
    label: "R",
    description: "Restricted — under 17 requires accompanying parent or adult guardian.",
  },
  "NC-17": {
    id: "NC-17",
    label: "NC-17",
    description: "Adults Only — no one 17 and under admitted.",
  },
};

export function isContentRating(value: unknown): value is ContentRating {
  return typeof value === "string" && CONTENT_RATING_IDS.includes(value as ContentRating);
}

export const REALMS: Record<RealmId, RealmDefinition> = {
  cosmos: {
    label: "CHUZI COSMOS",
    short_label: "Cosmos",
    lexicon: {
      genre: "Galaxy",
      story: "Star System",
      scene: "Planet",
      scene_choice: "Trajectory",
      node: "Signal",
      node_type_choice: "Trajectory",
      node_type_media: "Transmission",
      node_type_go_to_scene: "Warp",
      player: "Voyager",
      library: "Star Chart",
      library_open: "Open Star Chart",
      library_close: "Close Star Chart",
      editor: "Mission Control",
      publish: "Launch",
      the_end: "Final Orbit",
      media_pool: "Cargo Bay",
      scene_graph: "Star Chart",
      watch_path: "Your trajectory",
      untitled_story: "Untitled Star System",
      unknown_genre: "Unknown Galaxy",
      scenes_count: "planets",
      choices_count: "trajectories",
      drafts_published: "Drafts + Launched",
      published_ver: "Launched ver.",
      draft: "Draft",
      no_scenes_yet: "No planets in this chart yet.",
      no_path_yet: "No trajectory to show yet.",
      menu_empty_drafts: "No star systems yet. Chart one to begin.",
      menu_empty_published: "No launched systems in the chart.",
      menu_published_heading: "Launched constellations",
      menu_create_story: "New star system",
      menu_create_film: "Create film",
      film_title_placeholder: "Star system title",
      select_genre: "Select galaxy",
      genre_field_aria: "Galaxy",
      delete_story_verb: "Delete star system",
      title_scene_default: "Title planet",
      choices_made_stat: "trajectories taken",
      content_rating: "Audience Class",
      content_rating_field_aria: "Audience class",
      select_content_rating: "Select audience class",
      unrated: "Unclassified",
      viewer_credits: "Fuel Cells",
      creator_credits: "Stardust",
      editor_media_upload: "Upload Transmission",
      editor_media_preview: "Transmission Preview",
      editor_alt_media: "Additional Transmission",
      editor_choices: "Trajectories",
      editor_scene_settings: "Planet Settings",
      editor_title_scene: "Title Planet",
      editor_ending_scene: "Final Orbit",
      editor_play: "Engage",
      editor_pause: "Hold",
      editor_prev_frame: "Previous Frame",
      editor_next_frame: "Next Frame",
      editor_seek: "Seek",
      editor_no_media: "No transmission assigned",
      editor_uploading: "Transmitting\u2026",
      editor_drop_media: "Drop transmission here",
      editor_scene_type: "Planet Type",
      editor_save: "Lock In",
      editor_scene_color: "Planet Hue",
    },
    locales: {
      es: {
        genre: "Galaxia",
        story: "Sistema Estelar",
        scene: "Planeta",
        scene_choice: "Trayectoria",
        player: "Viajero",
        library: "Carta Estelar",
        editor: "Control de Misión",
        publish: "Lanzar",
        the_end: "Órbita Final",
        untitled_story: "Sistema Estelar sin título",
        menu_create_story: "Nuevo sistema estelar",
        film_title_placeholder: "Título del sistema estelar",
        select_genre: "Seleccionar galaxia",
      },
      fr: {
        genre: "Galaxie",
        story: "Système Stellaire",
        scene: "Planète",
        scene_choice: "Trajectoire",
        player: "Voyageur",
        library: "Carte Stellaire",
        editor: "Contrôle de Mission",
        publish: "Lancer",
        the_end: "Orbite Finale",
        untitled_story: "Système stellaire sans titre",
        menu_create_story: "Nouveau système stellaire",
        film_title_placeholder: "Titre du système stellaire",
        select_genre: "Sélectionner une galaxie",
      },
      de: {
        genre: "Galaxie",
        story: "Sternsystem",
        scene: "Planet",
        player: "Reisender",
        publish: "Starten",
      },
      pt: {
        genre: "Galáxia",
        story: "Sistema Estelar",
        scene: "Planeta",
        player: "Viajante",
        publish: "Lançar",
      },
    },
  },
  wilds: {
    label: "CHUZI WILDS",
    short_label: "Wilds",
    lexicon: {
      genre: "Biome",
      story: "Grove",
      scene: "Clearing",
      scene_choice: "Trail",
      node: "Seed",
      node_type_choice: "Trail",
      node_type_media: "Bloom",
      node_type_go_to_scene: "Crossing",
      player: "Wanderer",
      library: "Canopy",
      library_open: "Open Canopy",
      library_close: "Close Canopy",
      editor: "Heartwood",
      publish: "Plant",
      the_end: "Roots",
      media_pool: "Undergrowth",
      scene_graph: "Canopy",
      watch_path: "Your trail",
      untitled_story: "Untitled Grove",
      unknown_genre: "Unknown Biome",
      scenes_count: "clearings",
      choices_count: "trails",
      drafts_published: "Drafts + Planted",
      published_ver: "Planted ver.",
      draft: "Draft",
      no_scenes_yet: "No clearings in this canopy yet.",
      no_path_yet: "No trail to show yet.",
      menu_empty_drafts: "No groves yet. Plant one to begin.",
      menu_empty_published: "No planted groves in the canopy.",
      menu_published_heading: "Planted groves",
      menu_create_story: "New grove",
      menu_create_film: "Create film",
      film_title_placeholder: "Grove title",
      select_genre: "Select biome",
      genre_field_aria: "Biome",
      delete_story_verb: "Delete grove",
      title_scene_default: "Title clearing",
      choices_made_stat: "trails taken",
      content_rating: "Field Guide",
      content_rating_field_aria: "Field guide",
      select_content_rating: "Select field guide",
      unrated: "Unmarked",
      viewer_credits: "Sap",
      creator_credits: "Pollen",
      editor_media_upload: "Upload Bloom",
      editor_media_preview: "Bloom Preview",
      editor_alt_media: "Additional Bloom",
      editor_choices: "Trails",
      editor_scene_settings: "Clearing Settings",
      editor_title_scene: "Title Clearing",
      editor_ending_scene: "Roots",
      editor_play: "Unfurl",
      editor_pause: "Rest",
      editor_prev_frame: "Previous Frame",
      editor_next_frame: "Next Frame",
      editor_seek: "Seek",
      editor_no_media: "No bloom assigned",
      editor_uploading: "Blooming\u2026",
      editor_drop_media: "Drop bloom here",
      editor_scene_type: "Clearing Type",
      editor_save: "Engrave",
      editor_scene_color: "Clearing Tint",
    },
    locales: {
      es: {
        genre: "Bioma",
        story: "Arboleda",
        scene: "Claro",
        scene_choice: "Sendero",
        player: "Errante",
        library: "Dosel",
        editor: "Duramen",
        publish: "Plantar",
        the_end: "Raíces",
        untitled_story: "Arboleda sin título",
        menu_create_story: "Nueva arboleda",
        film_title_placeholder: "Título de la arboleda",
        select_genre: "Seleccionar bioma",
      },
      fr: {
        genre: "Biome",
        story: "Bosquet",
        scene: "Clairière",
        scene_choice: "Sentier",
        player: "Vagabond",
        library: "Canopée",
        editor: "Cœur de bois",
        publish: "Planter",
        the_end: "Racines",
        untitled_story: "Bosquet sans titre",
        menu_create_story: "Nouveau bosquet",
        film_title_placeholder: "Titre du bosquet",
        select_genre: "Sélectionner un biome",
      },
      de: {
        genre: "Biom",
        story: "Hain",
        scene: "Lichtung",
        player: "Wanderer",
        publish: "Pflanzen",
      },
      pt: {
        genre: "Bioma",
        story: "Bosque",
        scene: "Clareira",
        player: "Andarilho",
        publish: "Plantar",
      },
    },
  },
};

export const FALLBACK_LEXICON: Record<string, string> = {
  genre: "Genre",
  story: "Story",
  scene: "Scene",
  scene_choice: "Choice",
  node: "Node",
  node_type_choice: "Choice",
  node_type_media: "Media",
  node_type_go_to_scene: "Go to scene",
  player: "Player",
  library: "Library",
  library_open: "Open scene tree",
  library_close: "Close scene tree",
  editor: "Editor",
  publish: "Publish",
  the_end: "The End",
  media_pool: "Media Pool",
  scene_graph: "Scene tree",
  watch_path: "Your path",
  untitled_story: "Untitled Story",
  unknown_genre: "Unknown Genre",
  scenes_count: "scenes",
  choices_count: "choices",
  drafts_published: "Drafts + Published",
  published_ver: "Published ver.",
  draft: "Draft",
  no_scenes_yet: "No scenes available yet.",
  no_path_yet: "No path to show yet.",
  menu_empty_drafts: "No films yet. Create one to get started.",
  menu_empty_published: "No published films found.",
  menu_published_heading: "Published Films",
  menu_create_story: "Create Story",
  menu_create_film: "Create Film",
  film_title_placeholder: "Film title",
  select_genre: "Select genre",
  genre_field_aria: "Film genre",
  delete_story_verb: "Delete film",
  title_scene_default: "Title Scene",
  choices_made_stat: "choices made",
  content_rating: "Rating",
  content_rating_field_aria: "Content rating",
  select_content_rating: "Select rating",
  unrated: "Not Rated",
  viewer_credits: "Viewer Credits",
  creator_credits: "Creator Credits",
  editor_media_upload: "Upload Media",
  editor_media_preview: "Media Preview",
  editor_alt_media: "Additional Media",
  editor_choices: "Choices",
  editor_scene_settings: "Scene Settings",
  editor_title_scene: "Title Scene",
  editor_ending_scene: "Ending Scene",
  editor_play: "Play",
  editor_pause: "Pause",
  editor_prev_frame: "Previous Frame",
  editor_next_frame: "Next Frame",
  editor_seek: "Seek",
  editor_no_media: "No media assigned",
  editor_uploading: "Uploading\u2026",
  editor_drop_media: "Drop media here",
  editor_scene_type: "Scene Type",
  editor_save: "Save",
  editor_scene_color: "Scene Color",
};

/**
 * Per-locale overrides for FALLBACK_LEXICON. Missing keys fall through to
 * the English fallback. Mirrors PHP `chuzi_realms.fallback_locales`.
 */
export const FALLBACK_LOCALES: Partial<
  Record<LocaleId, Record<string, string>>
> = {
  es: {
    genre: "Género",
    story: "Historia",
    scene: "Escena",
    scene_choice: "Elección",
    player: "Reproductor",
    library: "Biblioteca",
    editor: "Editor",
    publish: "Publicar",
    the_end: "Fin",
    untitled_story: "Historia sin título",
    menu_create_story: "Crear historia",
    menu_create_film: "Crear película",
    film_title_placeholder: "Título de la película",
    select_genre: "Seleccionar género",
    delete_story_verb: "Eliminar película",
  },
  fr: {
    genre: "Genre",
    story: "Histoire",
    scene: "Scène",
    scene_choice: "Choix",
    player: "Lecteur",
    library: "Bibliothèque",
    editor: "Éditeur",
    publish: "Publier",
    the_end: "Fin",
    untitled_story: "Histoire sans titre",
    menu_create_story: "Créer une histoire",
    menu_create_film: "Créer un film",
    film_title_placeholder: "Titre du film",
    select_genre: "Sélectionner un genre",
    delete_story_verb: "Supprimer le film",
  },
  de: {
    genre: "Genre",
    story: "Geschichte",
    scene: "Szene",
    publish: "Veröffentlichen",
    the_end: "Ende",
    untitled_story: "Unbenannte Geschichte",
    menu_create_story: "Geschichte erstellen",
    film_title_placeholder: "Filmtitel",
    select_genre: "Genre auswählen",
  },
  pt: {
    genre: "Gênero",
    story: "História",
    scene: "Cena",
    publish: "Publicar",
    the_end: "Fim",
    untitled_story: "História sem título",
    menu_create_story: "Criar história",
    film_title_placeholder: "Título do filme",
    select_genre: "Selecionar gênero",
  },
};

function resolveFallback(locale: LocaleId | null | undefined): Record<string, string> {
  const overrides = locale && FALLBACK_LOCALES[locale];
  return overrides ? { ...FALLBACK_LEXICON, ...overrides } : { ...FALLBACK_LEXICON };
}

function resolveRealm(
  realmId: RealmId,
  locale: LocaleId | null | undefined
): Record<string, string> {
  const realm = REALMS[realmId];
  const overrides = locale && realm.locales ? realm.locales[locale] : undefined;
  return overrides ? { ...realm.lexicon, ...overrides } : { ...realm.lexicon };
}

/**
 * Get a lexicon value for a realm + locale, falling back to the neutral
 * lexicon (which itself respects locale).
 */
export function t(
  realmId: RealmId | null | undefined,
  key: string,
  fallback = "",
  locale: LocaleId | null | undefined = null
): string {
  if (realmId && REALMS[realmId]) {
    const realmLex = resolveRealm(realmId, locale);
    if (realmLex[key] !== undefined) return realmLex[key];
  }
  const fb = resolveFallback(locale);
  return fb[key] ?? fallback;
}

/**
 * Get the full merged lexicon for a realm + locale (realm lexicon on top of
 * locale-aware fallback).
 */
export function lexiconForRealm(
  realmId: RealmId | null | undefined,
  locale: LocaleId | null | undefined = null
): Record<string, string> {
  const fb = resolveFallback(locale);
  if (!realmId || !REALMS[realmId]) {
    return fb;
  }
  return { ...fb, ...resolveRealm(realmId, locale) };
}
