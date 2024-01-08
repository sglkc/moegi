import { defineDynamicResource, defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { name, description, homepage, version } = packageJson
const nameCap = name[0].toUpperCase() + name.slice(1);
const [major, minor, patch, label = '0'] = version
  .replace(/[^\d.-]+/g, '')
  .split(/[.-]/)

export default defineManifest((env) => {
  const nameExt = (env.mode !== 'production' ? '[DEV] ' : '') + nameCap;

  return {
    manifest_version: 3,
    name: nameExt,
    version: `${major}.${minor}.${patch}.${label}`,
    version_name: version,
    description: description,
    homepage_url: homepage,
    icons: {
      '16': 'icons/icon16.png',
      '19': 'icons/icon19.png',
      '48': 'icons/icon48.png',
      '96': 'icons/icon48.png'
    },
    default_locale: 'en',
    action: {
      default_icon: {
        '16': 'icons/icon16.png',
        '19': 'icons/icon19.png',
        '48': 'icons/icon48.png',
        '96': 'icons/icon48.png'
      },
      default_title: nameExt,
      default_popup: 'index.html'
    },
    permissions: [
      'activeTab',
      'declarativeContent',
      'storage'
    ],
    background: {
      service_worker: 'src/background/worker.ts',
      type: 'module'
    },
    content_scripts: [
      {
        js: ['src/content/script.ts'],
        matches: ['https://open.spotify.com/*']
      }
    ],
    externally_connectable: {
      ids: ['*'],
      matches: ['https://open.spotify.com/*'],
      accepts_tls_channel_id: false
    },
    host_permissions: [
      'https://translate.google.com/*'
    ],
    web_accessible_resources: [
      {
        matches: ['https://open.spotify.com/*'],
        resources: ['dict/*']
      },
      defineDynamicResource({
        matches: ['https://open.spotify.com/*']
      }),
    ]
  }
});
