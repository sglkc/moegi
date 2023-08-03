import { existsSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'
import { crx } from '@crxjs/vite-plugin'
import copy from 'vite-plugin-cp'
import manifestConfig from './manifest.config'

// https://vitejs.dev/config/
export default defineConfig(() => {
  const shouldCopyDict = !existsSync('./public/dict')

  return {
    build: {
      target: 'esnext'
    },
    plugins: [
      preact(),
      UnoCSS(),
      crx({ manifest: manifestConfig }),
      shouldCopyDict && copy({
        targets: [
          {
            src: 'node_modules/**/kuromoji/dict/*.dat.gz',
            dest: 'dist/dict',
            rename: ''
          },
          {
            src: 'node_modules/**/kuromoji/dict/*.dat.gz',
            dest: 'public/dict',
            rename: ''
          }
        ],
        hook: 'buildStart',
        globbyOptions: {
          dot: true,
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
    },
    server: {
      port: 5172,
      strictPort: true,
      hmr: {
        port: 5172,
      }
    }
  }
})
