import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }

            if (id.includes("react-router-dom") || id.includes("@tanstack/react-query")) {
              return "router-query-vendor";
            }

            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }

            if (id.includes("@radix-ui") || id.includes("lucide-react")) {
              return "ui-vendor";
            }

            return "vendor";
          }
        },
      },
    },
  },
}));
