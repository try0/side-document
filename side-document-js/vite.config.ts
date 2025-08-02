import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte({
    emitCss: false, // Enable CSS output
  })],
  css: {
    postcss: './postcss.config.js'
  },
  build: {
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
})
