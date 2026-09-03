// @ts-check
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const root = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://shopping.ejecuta.lat",
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "shopping-mcp": resolve(root, "packages/shopping-mcp/src/index.ts"),
      },
    },
    ssr: {
      noExternal: ["shopping-mcp"],
    },
  },
});
