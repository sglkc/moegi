import { preact } from '@preact/preset-vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['activeTab', 'declarativeContent', 'storage'],
    host_permissions: [
      'https://translate.google.com/*',
      'https://www2.deepl.com/*'
    ],
    // TODO: better security mybe
    externally_connectable: {
      ids: ['*'],
      matches: ['https://open.spotify.com/*'],
      accepts_tls_channel_id: false,
    },
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
