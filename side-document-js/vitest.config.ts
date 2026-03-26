import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte({ hot: false, emitCss: false })],
    resolve: {
        conditions: ['browser'],
    },
    test: {
        include: ['test/unit/**/*.test.ts'],
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['test/unit/setup.ts'],
    },
})
