// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  resolve: {
    alias: {
      // Allows imports like: import { Button } from "@/components/ui/button"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward all /api calls to Express backend — avoids CORS in dev
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
