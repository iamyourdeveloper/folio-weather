import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env so we can override backend URL without code changes
  const env = loadEnv(mode, import.meta.url, "");
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:8000";

  return {
    plugins: [
      react({
        // Enable Fast Refresh for better development experience
        fastRefresh: true,
        // Optimize JSX runtime for better performance
        jsxRuntime: 'automatic',
      }),
    ],
    // Performance optimizations
    esbuild: {
      // Optimize build performance
      target: 'es2020',
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    server: {
      port: 3000,
      host: true,
      // Enable HTTP/2 for better performance
      https: false,
      // Optimize development server
      hmr: {
        overlay: false, // Disable error overlay for better performance
      },
      // Optimize proxy configuration
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          // Reduced timeout for faster error detection
          timeout: 15000,
          // Connection pooling
          agent: false,
        },
      },
      // Improve development server performance
      fs: {
        // Allow serving files from one level up to the project root
        allow: [".."],
        // Optimize file watching
        strict: false,
      },
      // Optimize middleware
      middlewareMode: false,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
        "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
        "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
        "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
        "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      // Optimize build for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            // Split large dependencies into separate chunks
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            utils: ["axios", "lucide-react"],
          },
        },
      },
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 600,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "axios",
        "lucide-react",
      ],
    },
  };
});
