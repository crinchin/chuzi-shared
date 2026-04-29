import { defineConfig } from "tsup";

/**
 * Each subpath export gets its own entry; tsup compiles JSX and emits .d.ts
 * for all of them in one pass. `splitting: false` keeps each entry as a
 * standalone bundle so apps can deep-import without pulling in unused realms.
 */
export default defineConfig({
  entry: {
    index: "src/index.ts",
    "types/index": "src/types/index.ts",
    "config/index": "src/config/index.ts",
    "themes/index": "src/themes/index.ts",
    "api/index": "src/api/index.ts",
    "input/index": "src/input/index.ts",
    "realms/index": "src/realms/index.ts",
    "realms/cosmos/index": "src/realms/cosmos/index.ts",
    "realms/wilds/index": "src/realms/wilds/index.ts",
    "ui/index": "src/ui/index.ts",
    "realms/cosmos/components/index": "src/realms/cosmos/components/index.ts",
    "realms/wilds/components/index": "src/realms/wilds/components/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  splitting: false,
  treeshake: true,
  external: [
    "react",
    "react/jsx-runtime",
    "react-dom",
    "react-native",
    "react-native-web",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],
});
