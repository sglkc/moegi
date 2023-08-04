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
    const originalElement = lyricElement.firstElementChild! as HTMLElement;
    const originalText = originalElement.innerText.trim();

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
  const convertedElements = document.querySelectorAll('.converted-lyrics');

  convertedElements.forEach((el) => el.remove());

  if (convertedElements.length && !options.romanization) {
    convertedElements.forEach((el) => el.remove());
    return;
  }

  await convertLyrics();

  // Logic for original lyrics display
  lyricElements.forEach((lyricElement) => {
    const [original, converted] =
      lyricElement.children as HTMLCollectionOf<HTMLElement>;

    if (options.romanization && options.hideOriginal && converted) {
      original.style.display = 'none';
    } else {
      original.style.display = '';
    }
  });
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);
