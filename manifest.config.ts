import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/)

export default defineManifest((env) => ({
  manifest_version: 3,
  name: (env.mode !== 'production') ? '[DEV] Moegi' : 'Moegi',
  version: `${major}.${minor}.${patch}.${label}`,
  version_name: version,
  description: packageJson.description,
  homepage_url: packageJson.homepage,
  icons: {
    16: 'icons/icon16.png',
    19: 'icons/icon19.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png'
  },
  default_locale: 'en',
  action: {
    default_icon: {
      16: 'icons/icon16.png',
      19: 'icons/icon19.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png'
    },
    default_title: 'Moegi Settings',
    default_popup: 'index.html'
  },
  permissions: [
    'storage',
    'tabs'
  ],
}))
