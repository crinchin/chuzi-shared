import { createContext, useContext, useMemo, type ReactNode } from "react";
import { lexiconForRealm, t as translateRealm } from "../../config/index.js";
import { getThemeTokens, type RealmThemeTokens } from "../../themes/index.js";
import type { LocaleId, RealmId } from "../../types/index.js";

/**
 * Realm-aware theme + lexicon context. Every chuzi-shared/ui primitive reads
 * from this; consuming apps wrap their tree once at the top level. Switching
 * realms or locales re-renders all consumers without prop drilling.
 */

export interface RealmTheme {
  realmId: RealmId | null;
  locale: LocaleId | null;
  tokens: RealmThemeTokens;
  /** Realm + locale aware lexicon lookup. */
  t: (key: string, fallback?: string) => string;
  /** Full merged lexicon for the current realm + locale. */
  lexicon: Record<string, string>;
}

const RealmThemeContext = createContext<RealmTheme | null>(null);

export interface RealmThemeProviderProps {
  realmId: RealmId | null;
  locale?: LocaleId | null;
  children: ReactNode;
}

export function RealmThemeProvider({
  realmId,
  locale = null,
  children,
}: RealmThemeProviderProps) {
  const value = useMemo<RealmTheme>(() => {
    return {
      realmId,
      locale,
      tokens: getThemeTokens(realmId),
      lexicon: lexiconForRealm(realmId, locale),
      t: (key, fallback = "") => translateRealm(realmId, key, fallback, locale),
    };
  }, [realmId, locale]);

  return (
    <RealmThemeContext.Provider value={value}>
      {children}
    </RealmThemeContext.Provider>
  );
}

export function useRealmTheme(): RealmTheme {
  const ctx = useContext(RealmThemeContext);
  if (!ctx) {
    throw new Error(
      "useRealmTheme: no RealmThemeProvider in tree. Wrap your app root with <RealmThemeProvider realmId={...} />.",
    );
  }
  return ctx;
}
