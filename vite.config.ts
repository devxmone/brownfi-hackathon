// @ts-nocheck

import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import svgr from 'vite-plugin-svgr';

const renderChunks = (deps: Record<string, string>) => {
  const chunks: any = {};
  Object.keys(deps).forEach((key) => {
    if (['react', 'react-router-dom', 'react-dom', 'stream-browserify'].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env': {},
  },
  optimizeDeps: {
    exclude: ['web3'],
  },
  resolve: {
    alias: {
      abis: path.resolve('./src/abis'),
      assets: path.resolve('./src/assets'),
      components: path.resolve('./src/components'),
      connectors: path.resolve('./src/connectors'),
      constants: path.resolve('./src/constants'),
      contexts: path.resolve('./src/contexts'),
      hooks: path.resolve('./src/hooks'),
      pages: path.resolve('./src/pages'),

      state: path.resolve('./src/state'),
      theme: path.resolve('./src/theme'),
      types: path.resolve('./src/types'),
      utils: path.resolve('./src/utils'),
      'sdk-core': path.resolve('./src/sdk-core'),
      '@uniswap/sdk-core': path.resolve('./src/sdk-core'),
      'v2-sdk': path.resolve('./src/v2-sdk'),
      '@uniswap/v2-sdk': path.resolve('./src/v2-sdk'),

      //Fix build dependencies
      process: 'process/browser',
      'readable-stream': 'vite-compatible-readable-stream',
      zlib: 'browserify-zlib',
      util: 'util',
    },
  },
  plugins: [
    ViteEjsPlugin((viteConfig) => ({
      env: viteConfig.env,
    })),
    react(),
    macrosPlugin(),
    svgr(),
  ],
  build: {
    manifest: true,
    sourcemap: false,
    outDir: path.join(__dirname, 'build'),
    rollupOptions: {
      // output: {
      //   manualChunks: {
      //     vendor: ['react', 'react-router-dom', 'react-dom', 'stream-browserify'],
      //     ...renderChunks(dependencies),
      //   },
      // },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
