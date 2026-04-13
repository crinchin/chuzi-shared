import type { RealmId, RealmDefinition } from "../types/index.js";

export const REALM_IDS: readonly RealmId[] = ["cosmos", "wilds"] as const;

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
};

/**
 * Get a lexicon value for a realm, falling back to the neutral lexicon.
 */
export function t(
  realmId: RealmId | null | undefined,
  key: string,
  fallback = ""
): string {
  if (realmId && REALMS[realmId]) {
    const val = REALMS[realmId].lexicon[key];
    if (val !== undefined) return val;
  }
  return FALLBACK_LEXICON[key] ?? fallback;
}

/**
 * Get the full merged lexicon for a realm (realm lexicon on top of fallbacks).
 */
export function lexiconForRealm(
  realmId: RealmId | null | undefined
): Record<string, string> {
  if (!realmId || !REALMS[realmId]) {
    return { ...FALLBACK_LEXICON };
  }
  return { ...FALLBACK_LEXICON, ...REALMS[realmId].lexicon };
}
