import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // happy-dom for feature DOM tests; pure util tests also run fine here
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['utils/**/*.test.ts', 'entrypoints/**/*.test.ts'],
    // Kuroshiro/kuromoji dictionary init can take a few seconds on cold start
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': import.meta.dirname,
    },
  },
})
