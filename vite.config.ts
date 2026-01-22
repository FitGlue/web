import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      // Only upload source maps in production builds
      isProd && sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: './dist/**',
          ignore: ['node_modules'],
        },
        release: {
          name: process.env.VITE_SENTRY_RELEASE || `fitglue-web@${new Date().toISOString()}`,
        },
        // Don't fail the build if source map upload fails
        errorHandler: (err) => {
          console.warn('Sentry source map upload failed:', err);
        },
      }),
    ].filter(Boolean),
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
      sourcemap: true, // Enable source maps
      rollupOptions: {
        input: {
          // Static pages are now built by Skier, only React app entry point here
          app: resolve(__dirname, 'public/app/index.html'),
        },
        output: {
          sourcemapExcludeSources: false, // Include sources in source maps
        },
      },
    },
  };
});
