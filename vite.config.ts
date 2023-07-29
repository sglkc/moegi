import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifestConfig from './manifest.config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    UnoCSS(),
    crx({ manifest: manifestConfig }),
  ],
  server: {
    port: 5172,
    strictPort: true,
    hmr: {
      port: 5172,
    }
  }
})
