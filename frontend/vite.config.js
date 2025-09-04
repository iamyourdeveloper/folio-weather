import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env so we can override backend URL without code changes
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:8000";

  return {
    plugins: [
      react({
        // Enable Fast Refresh for better development experience
        fastRefresh: true,
      }),
    ],
    server: {
      port: 3000,
      host: true,
      // Enable HTTP/2 for better performance
      https: false,
      // Optimize proxy configuration
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          // Add timeout to prevent hanging requests
          timeout: 30000,
        },
      },
      // Improve development server performance
      fs: {
        // Allow serving files from one level up to the project root
        allow: [".."],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@context": path.resolve(__dirname, "./src/context"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@assets": path.resolve(__dirname, "./src/assets"),
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
