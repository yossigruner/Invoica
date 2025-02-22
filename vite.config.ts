import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { handleLogWrite } from './src/api/logHandler';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/logs': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.method === 'POST') {
              handleLogWrite(req as Request)
                .then(response => {
                  res.statusCode = response.status;
                  res.end();
                })
                .catch(error => {
                  console.error('Error handling logs:', error);
                  res.statusCode = 500;
                  res.end();
                });
            }
          });
        },
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
