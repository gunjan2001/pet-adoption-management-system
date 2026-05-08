// vite.config.ts
import tailwindcss from "file:///C:/Users/SESA767986/Desktop/workspace/Gunjan/pet-adoption-management-system/client/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/Users/SESA767986/Desktop/workspace/Gunjan/pet-adoption-management-system/client/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { defineConfig } from "file:///C:/Users/SESA767986/Desktop/workspace/Gunjan/pet-adoption-management-system/client/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\SESA767986\\Desktop\\workspace\\Gunjan\\pet-adoption-management-system\\client";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Allows imports like: import { Button } from "@/components/ui/button"
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Ensure SPA mode with fallback to index.html
    rollupOptions: {
      input: path.resolve(__vite_injected_original_dirname, "./index.html")
    }
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
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxTRVNBNzY3OTg2XFxcXERlc2t0b3BcXFxcd29ya3NwYWNlXFxcXEd1bmphblxcXFxwZXQtYWRvcHRpb24tbWFuYWdlbWVudC1zeXN0ZW1cXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxTRVNBNzY3OTg2XFxcXERlc2t0b3BcXFxcd29ya3NwYWNlXFxcXEd1bmphblxcXFxwZXQtYWRvcHRpb24tbWFuYWdlbWVudC1zeXN0ZW1cXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9TRVNBNzY3OTg2L0Rlc2t0b3Avd29ya3NwYWNlL0d1bmphbi9wZXQtYWRvcHRpb24tbWFuYWdlbWVudC1zeXN0ZW0vY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKSx0YWlsd2luZGNzcygpLF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgLy8gQWxsb3dzIGltcG9ydHMgbGlrZTogaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIkAvY29tcG9uZW50cy91aS9idXR0b25cIlxyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gRW5zdXJlIFNQQSBtb2RlIHdpdGggZmFsbGJhY2sgdG8gaW5kZXguaHRtbFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBpbnB1dDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vaW5kZXguaHRtbCcpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC8vIEZvcndhcmQgYWxsIC9hcGkgY2FsbHMgdG8gRXhwcmVzcyBiYWNrZW5kIFx1MjAxNCBhdm9pZHMgQ09SUyBpbiBkZXZcclxuICAgICAgXCIvYXBpXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwXCIsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJlOiAocHJveHkpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlByb3h5IGVycm9yOlwiLCBlcnIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd2IsT0FBTyxpQkFBaUI7QUFDaGQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUg3QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFFLFlBQVksQ0FBRTtBQUFBLEVBQ2hDLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLE1BRUwsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxlQUFlO0FBQUEsTUFDYixPQUFPLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxNQUVMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFdBQVcsQ0FBQyxVQUFVO0FBQ3BCLGdCQUFNLEdBQUcsU0FBUyxDQUFDLFFBQVE7QUFDekIsb0JBQVEsSUFBSSxnQkFBZ0IsR0FBRztBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
