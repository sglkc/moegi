import fs from 'node:fs';
import path from 'node:path';
import { defineWxtModule } from 'wxt/modules';

// https://github.com/aiktb/FuriganaMaker/blob/6a4e8f43/packages/extension/wxt.config.ts#L61
// separate from wxt.config.ts in case of supplying the whole dict from repo
export default defineWxtModule((wxt) => {
  wxt.hook('build:publicAssets', (wxt, assets) => {
    const srcDir = path.resolve(__dirname, '../node_modules/@sglkc/kuromoji/dict/');
    const filenames = fs.readdirSync(srcDir);
    const destDir = path.resolve(wxt.config.outDir, 'dict');

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

    for (const filename of filenames) {
      const absoluteSrc = path.resolve(srcDir, filename);
      const relativeDest = path.resolve(destDir, filename);

      assets.push({ absoluteSrc, relativeDest });
    }
  });

  wxt.hook('build:manifestGenerated', (_, manifest) => {
    manifest.web_accessible_resources ??= [];

    // @ts-expect-error idk why the type is string
    manifest.web_accessible_resources.push({
      matches: ['https://open.spotify.com/*'],
      resources: ['dict/*']
    });
  });
});
