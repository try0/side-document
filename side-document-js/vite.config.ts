import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const isLib = process.env.BUILD_LIB === 'true';

export default defineConfig({
  plugins: [svelte({
    emitCss: false,
  })],
  css: {
    postcss: './postcss.config.js'
  },
  build: isLib
    ? {
        lib: {
          entry: 'src/SideDocument.ts',
          name: 'SD',
          fileName: (format) => `side-document.${format}.js`,
        },
        rollupOptions: {
          output: {
            exports: 'named',
          },
        },
        target: 'es2022',
        minify: true
      }
    : {
        outDir: 'dist-demo',
        rollupOptions: {
          input: 'index.html'
        }
      }
})