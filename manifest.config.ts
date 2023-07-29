import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/)

export default defineManifest((env) => ({
  manifest_version: 3,
  name:
    env.mode === 'staging'
      ? '[INTERNAL] CRXJS Power Tools'
      : 'CRXJS Power Tools',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  action: {
    default_popup: 'index.html'
  }
}))
