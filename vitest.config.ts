import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // happy-dom for feature DOM tests; pure util tests also run fine here
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['utils/**/*.test.ts', 'entrypoints/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
