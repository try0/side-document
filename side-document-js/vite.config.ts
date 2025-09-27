import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'

const isLib = process.env.BUILD_LIB === 'true';

export default defineConfig({
  base: './',
  plugins: [svelte({
    emitCss: false,
  }),
  dts({
    outDir: 'dist',
    rollupTypes: true,
  }),
  ],
  css: {
    postcss: './postcss.config.js'
  },
  build: isLib
    ? {
      lib: {
        entry: 'src/SideDocument.ts',
        name: 'SideDocument',
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