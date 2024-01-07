// @ts-ignore
import { romanize } from '@romanize/korean';
import { MoegiOptionsKey } from '@/services/options';
import {
  lyricElements,
  options,
  scrollToActiveLyric
} from '../init';
import createToast from '../toast';

const romanizationKeys: Array<MoegiOptionsKey> = [
  'romanization', 'romanization_lang', 'hangul_system'
];

// Simple hangul check
const isHangul = (str: string) =>
  /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g
    .test(str);

// Convert lyric lines using hangul-romanization if they have any Korean characters
async function convertLyrics() {
  for (const lyricElement of lyricElements) {
    const originalElement = lyricElement.firstElementChild!;
    const originalText = originalElement.textContent!.trim();

    if (!isHangul(originalText)) continue;

    const convertedElement = lyricElement.querySelector('.converted-lyrics')!;
    const convertedText = romanize(originalText, options.hangul_system);

    convertedElement.innerHTML = convertedText.toString();
  }

  createToast('Korean romanization generated').showToast();
}

async function applyRomanization(e: WindowEventMap['moegioptions']) {
  const shouldUpdate = (Object.keys(e.detail ?? {}) as Array<MoegiOptionsKey>)
    .find((k) => romanizationKeys.includes(k));

  // Only continue if any of romanization keys was changed
  if (!shouldUpdate && (e.type === 'moegioptions')) return;

  // Clear past conversions to avoid duplicate elements
  document.querySelectorAll('.converted-lyrics')
    .forEach((el) => el.innerHTML = '');

  if (options.romanization && options.romanization_lang === 'kr')
    await convertLyrics();

  scrollToActiveLyric();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);
