import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['@radix-ui/react-select', 'react', 'react-dom'],
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-slot'
    ],
    force: true
  },
  build: {
    rollupOptions: {
      external: ["html2pdf.js"],
      output: {
        globals: {
          "html2pdf.js": "html2pdf",
        },
        manualChunks: {
          'radix': [
            '@radix-ui/react-select',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-slot'
          ]
        }
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
});
