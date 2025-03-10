import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      rollupOptions: {
        external: ["html2pdf.js"],
        output: {
          globals: {
            "html2pdf.js": "html2pdf",
          },
        },
      },
    },
    // Expose env variables to the client
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'process.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL),
    },
  };
});
