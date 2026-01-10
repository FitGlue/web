import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        login: resolve(__dirname, 'public/login.html'),
        register: resolve(__dirname, 'public/register.html'),
        logout: resolve(__dirname, 'public/logout.html'),
        forgotPassword: resolve(__dirname, 'public/forgot-password.html'),
        verifyEmail: resolve(__dirname, 'public/verify-email.html'),
        waitlist: resolve(__dirname, 'public/waitlist.html'),
        app: resolve(__dirname, 'public/app/index.html'),
      },
    },
  },
});
