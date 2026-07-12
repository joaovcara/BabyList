import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/BabyList/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        [`${base.replace(/\/$/, '')}/api`]: {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${base.replace(/\/$/, '')}/api`), '/api'),
        },
      },
    },
  };
});
