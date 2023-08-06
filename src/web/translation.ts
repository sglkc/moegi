import { lyricElements, options, scriptElement } from './init';

const extensionId = scriptElement.dataset.extensionId!;
const translate = (title: string, text: string) =>
  new Promise<string[]>((resolve) => {
    chrome.runtime.sendMessage(
      extensionId,
      { type: 'translate', title, text },
      resolve
    );
  });

async function translateLyrics() {

  // Get lyric elements and join them into a string of lines
  const lyricsArray = Array.from(lyricElements);
  const lyrics = lyricsArray
    .map((element) => element.firstElementChild!.textContent);

  const lyricsString = lyrics.join('\n');

  // Compare song title before and after translation to avoid doubles
  const titleElement =
    document.querySelector('[data-testid="context-item-link"]')!;
  const lastTitle = titleElement.textContent!;

  // Translate the string, split into array, and append to lyric container
  const translations = await translate(lastTitle, lyricsString);
  const newTitle = titleElement.textContent!;

  if (newTitle !== lastTitle) return;

  lyricsArray.forEach((lyricElement, index) => {
    const originalElement = lyricElement.firstElementChild!;
    const originalText = originalElement.textContent!.trim();

    if (originalText.length < 2) return;

    const translatedElement = document.createElement('p');
    const translatedText = translations.at(index);

    if (!translatedText) return;

    translatedElement.innerHTML = translatedText;
    translatedElement.classList.add('translated-lyrics');
    lyricElement.insertAdjacentElement('beforeend', translatedElement);
  });
}

async function applyTranslation() {

  // Clear past translations to avoid duplicate elements
  const translatedElements = document.querySelectorAll('.translated-lyrics');

  if (!options.translation) translatedElements.forEach((el) => el.remove());
  if (options.translation && !translatedElements.length) await translateLyrics();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyTranslation);
addEventListener('lyricsready', applyTranslation);
