// @ts-ignore: Ignore the missing type declarations for these imports
import { defineConfig } from "vite";
// @ts-ignore
import react from "@vitejs/plugin-react-swc";
// @ts-ignore
import path from "path";
// @ts-ignore
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // @ts-ignore: __dirname is available in Vite's config context
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: []
    }
  }
}));
