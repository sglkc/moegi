import Cyrillic from 'cyrillic-to-translit-js';
import {
  lyricElements,
  options,
  scrollToActiveLyric
} from '../init';
import createToast from '../toast';

// Simple cyrillic check
const isCyrillic = (str: string) => /[\w\u0430-\u044f]+/igu.test(str);

// Convert lyric lines using hangul-romanization if they have any Korean characters
async function convertLyrics() {
  for (const lyricElement of lyricElements) {
    const originalElement = lyricElement.firstElementChild!;
    const originalText = originalElement.textContent!.trim();

    if (!isCyrillic(originalText)) continue;

    const convertedElement = lyricElement.querySelector('.converted-lyrics')!;
    const convertedText = Cyrillic({
      preset: options.romanization_lang as 'ru' | 'uk'
    })
      .transform(originalText);

    convertedElement.innerHTML = convertedText.toString();
  }

  createToast('Cyrillic romanization generated').showToast();
}

async function applyRomanization() {
  // Clear past conversions to avoid duplicate elements
  document.querySelectorAll('.converted-lyrics')
    .forEach((el) => el.innerHTML = '');

  if (options.romanization && ['ru', 'uk'].includes(options.romanization_lang))
    await convertLyrics();

  scrollToActiveLyric();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);
