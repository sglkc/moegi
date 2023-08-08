import { defineConfig, transformerVariantGroup } from 'unocss'

export default defineConfig({
  theme: {
    fontFamily: {
      title: '"RocknRoll One", sans-serif',
      text: '"Quicksand", sans-serif'
    },
    colors: {
      text: '#1d230b',
      background: '#f6f9ec',
      primary: '#b7dc5e',
      secondary: '#e6efcd',
      accent: '#4b309c'
    }
  },
  transformers: [
    transformerVariantGroup()
  ]
})
