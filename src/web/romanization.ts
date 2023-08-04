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

  if (options.active) await convertLyrics();

  // Hide original element logic and scroll to active line if exists
  let activeElement: HTMLElement | undefined;

  lyricElements.forEach((lyricElement) => {
    const [original, converted] =
      lyricElement.children as HTMLCollectionOf<HTMLElement>;

    if (options.active && options.hideOriginal && converted) {
      original.style.display = 'none';
    } else {
      original.style.display = '';
    }

    // There are 2 default classes for lyrics as of writing
    if (lyricElement.classList.length > 2) activeElement = lyricElement;
  });

  if (activeElement) {
    setTimeout(() => activeElement!.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    }), 100);
  }
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyRomanization);
addEventListener('lyricsready', applyRomanization);
