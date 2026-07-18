import { preact } from '@preact/preset-vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    // activeTab: popup can read the active tab URL when opened
    // storage: options persistence
    permissions: ['activeTab', 'storage'],
    host_permissions: [
      // Google Translate API (background)
      'https://translate.google.com/*',
      // Query/message open Spotify tabs when options change
      'https://open.spotify.com/*',
    ],
  },
  modules: ['@wxt-dev/unocss'],
  imports: false,
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  },
  vite: () => ({
    plugins: [
      preact(),
    ],
  }),
})
