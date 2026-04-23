import tailwindcss from '@tailwindcss/vite';
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  resolve: {
    alias: {
      // Allows imports like: import { Button } from "@/components/ui/button"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure SPA mode with fallback to index.html
    rollupOptions: {
      input: path.resolve(__dirname, './index.html'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward all /api calls to Express backend — avoids CORS in dev
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("Proxy error:", err);
          });
        },
      },
    },
  },
});
