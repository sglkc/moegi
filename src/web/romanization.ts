import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { lyricElements, options, scriptElement } from './init';

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
}

async function applyRomanization() {

  // Clear past conversions to avoid duplicate elements
  document.querySelectorAll('.converted-lyrics').forEach((el) => el.remove());

  if (options.romanization) await convertLyrics();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);
