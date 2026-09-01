import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// Plain Vite + TanStack Start config — no third-party framework wrapper.
export default defineConfig(async ({ command }) => {
  const plugins = [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    viteReact(),
  ];

  // The Nitro plugin only needs to run for production builds — `vite dev`
  // serves the app directly.
  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(...nitro({ preset: "vercel" }));
  }

  return {
    plugins,
    css: { transformer: "lightningcss" },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    server: { port: 8080 },
  };
});
