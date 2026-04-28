import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { StoryListItem } from "../types/index.js";
import { useRealmTheme } from "./theme/RealmThemeProvider.js";

export interface FilmCardProps {
  film: StoryListItem;
  /** Tap/click handler. Without one, the card is a static block. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Realm-themed film card. Title falls back to the realm's "untitled" lexicon
 * (Untitled Star System / Untitled Grove). Genre falls back to the realm's
 * "unknown genre" string. Pressable when an onPress is provided; otherwise
 * renders a non-interactive View — important for list contexts that want
 * the press handled at the row level instead.
 */
export function FilmCard({ film, onPress, style }: FilmCardProps) {
  const { tokens, t } = useRealmTheme();

  const title = film.title?.trim() || t("untitled_story", "Untitled");
  const genre = film.genre?.trim() || t("unknown_genre", "Unknown");
  const sceneLabel = t("scenes_count", "scenes");
  const choiceLabel = t("choices_count", "choices");

  const inner = (
    <>
      <Text
        style={[styles.title, { color: tokens.text }]}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text style={[styles.meta, { color: tokens.muted }]}>
        {genre} · {film.scenes_count} {sceneLabel} · {film.choices_count}{" "}
        {choiceLabel}
      </Text>
      {film.creator?.name ? (
        <Text style={[styles.creator, { color: tokens.accent }]}>
          {film.creator.name}
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          { backgroundColor: tokens.bgMid, borderColor: tokens.accentSoft },
          pressed && { opacity: 0.92 },
          style,
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: tokens.bgMid, borderColor: tokens.accentSoft },
        style,
      ]}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minWidth: 240,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
  },
  creator: {
    fontSize: 12,
    fontWeight: "600",
  },
});
