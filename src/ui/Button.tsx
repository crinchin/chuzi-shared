import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useRealmTheme } from "./theme/RealmThemeProvider.js";

export type ButtonVariant = "primary" | "ghost";

export interface ButtonProps
  extends Omit<PressableProps, "style" | "children"> {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Realm-themed button. Primitives come from react-native so the same
 * component renders on web (via react-native-web) and native. Colors come
 * from the active realm's theme tokens — primary fills with accent, ghost
 * draws an accent outline.
 */
export function Button({
  label,
  variant = "primary",
  style,
  ...rest
}: ButtonProps) {
  const { tokens } = useRealmTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variant === "primary"
          ? { backgroundColor: tokens.accent }
          : {
              backgroundColor: "transparent",
              borderColor: tokens.accent,
              borderWidth: 1,
            },
        pressed && { opacity: 0.85 },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          {
            color: variant === "primary" ? tokens.bgDeep : tokens.accent,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
