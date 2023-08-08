import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { MoegiOptionsKey } from '@/services/options';
import { lyricElements, options, scriptElement } from './init';
import createToast from './toast';

const romanizationKeys: Array<MoegiOptionsKey> = [
  'romanization', 'to', 'mode', 'romajiSystem', 'delimiter_end',
  'delimiter_start'
];
const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer({
  dictPath: scriptElement.dataset.dictPath!
});

kuroshiro.init(kuromojiAnalyzer);
scriptElement.removeAttribute('data-dict-path');

// Convert lyric lines using Kuroshiro if they have any Japanese characters
async function convertLyrics() {
  for (const lyricElement of lyricElements) {
    const originalElement = lyricElement.firstElementChild!;
    const originalText = originalElement.textContent!.trim();

    if (!kuroshiro.Util.hasJapanese(originalText)) continue;

    const convertedElement = document.createElement('p');
    const convertedText = await kuroshiro.convert(originalText, options);

    convertedElement.innerHTML = convertedText;
    convertedElement.classList.add('converted-lyrics');
    lyricElement.insertAdjacentElement('beforeend', convertedElement);
  }

  createToast('Japanese romanization generated').showToast();
}

async function applyRomanization(e: WindowEventMap['moegioptions']) {
  const shouldUpdate = (Object.keys(e.detail ?? {}) as Array<MoegiOptionsKey>)
    .find((k) => romanizationKeys.includes(k));

  // Only continue if any of romanization keys was changed
  if (!shouldUpdate && (e.type === 'moegioptions')) return;

  // Clear past conversions to avoid duplicate elements
  document.querySelectorAll('.converted-lyrics').forEach((el) => el.remove());
  if (options.romanization) await convertLyrics();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);
