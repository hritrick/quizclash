import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'deployment-revision',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'deployment.json', source: JSON.stringify({ revision: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null }) });
    },
  }],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000',
        ws: true,
      },
    },
  },
});
