import { resolve } from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifestConfig from './manifest.config'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext'
  },
  plugins: [
    preact(),
    UnoCSS(),
    crx({ manifest: manifestConfig }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src')
      }
    ]
  },
  server: {
    port: 5172,
    strictPort: true,
    hmr: {
      port: 5172,
    }
  }
})
