import { googleTranslateApi } from 'google-translate-api-x';
import { MoegiOptionsKey } from '@/services/options';
import { lyricElements, options, scriptElement } from './init';
import createToast from './toast';

const translationKeys: Array<MoegiOptionsKey> = [
  'translation', 'languageTarget'
];
const extensionId = scriptElement.dataset.extensionId!;
const translate = (
  title: string,
  text: string,
  options: googleTranslateApi.RequestOptions
) =>
  new Promise<string[]>((resolve) => {
    chrome.runtime.sendMessage(
      extensionId,
      { type: 'translate', title, text, options },
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
  const toast = createToast('Loading translation', -1);
  toast.showToast();
  const translations = await translate(lastTitle, lyricsString, {
    to: options.languageTarget
  });
  const newTitle = titleElement.textContent!;

  toast.hideToast();

  if (newTitle !== lastTitle) return;

  createToast('Translation loaded').showToast();
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

async function applyTranslation(e: WindowEventMap['moegioptions']) {
  const shouldUpdate = (Object.keys(e.detail ?? {}) as Array<MoegiOptionsKey>)
    .find((k) => translationKeys.includes(k));

  // Only continue if any of translation keys was changed
  if (!shouldUpdate && (e.type === 'moegioptions')) return;

  // Clear past translations to avoid duplicate elements
  document.querySelectorAll('.translated-lyrics').forEach((el) => el.remove());
  if (options.translation) await translateLyrics();
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyTranslation);
addEventListener('lyricsready', applyTranslation);
