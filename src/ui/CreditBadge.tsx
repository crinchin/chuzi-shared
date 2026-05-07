import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useRealmTheme } from "./theme/RealmThemeProvider.js";

export type CreditRole = "viewer" | "creator";

export interface CreditBadgeProps {
  role: CreditRole;
  value: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Realm-themed credit badge — a bordered label showing a viewer or creator
 * credit balance. The label text adapts to the active realm's lexicon and
 * colors pull from the realm's theme tokens.
 */
export function CreditBadge({ role, value, style }: CreditBadgeProps) {
  const { tokens, t } = useRealmTheme();

  const label =
    role === "viewer"
      ? t("viewer_credits", "Viewer Credits")
      : t("creator_credits", "Creator Credits");

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: tokens.accent,
          backgroundColor: tokens.bgMid,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: tokens.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: tokens.accent }]}>
        {value.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
});
