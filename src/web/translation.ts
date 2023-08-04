import { googleTranslateApi } from 'google-translate-api-x';
import { lyricElements, scriptElement } from './init';

type TranslateResult = googleTranslateApi.TranslationResponse;

const extensionId = scriptElement.dataset.extensionId!;
const translate = (text: string)  => new Promise<TranslateResult>((resolve) => {
  chrome.runtime.sendMessage(extensionId, { type: 'translate', text }, resolve);
});

async function applyTranslation() {

  // Get lyric elements and join them into a string of lines
  const lyricsArray = Array.from(lyricElements);
  const lyrics = lyricsArray.map((element) => element.innerText);
  const lyricsString = lyrics.join('\n');

  // Translate the string, split into array, and append to lyric container
  const translateResult = await translate(lyricsString);
  const translations = translateResult.text.split('\n');

  lyricsArray.forEach((lyricElement, index) => {
    const originalElement = lyricElement.firstElementChild! as HTMLElement;
    const originalText = originalElement.innerText.trim();

    if (originalText.length < 2) return;

    const translatedElement = document.createElement('p');
    const translatedText = translations[index];

    translatedElement.innerHTML = translatedText;
    translatedElement.classList.add('translated-lyrics');
    lyricElement.insertAdjacentElement('beforeend', translatedElement);
  });
}

// Apply new options on event and on lyrics ready
addEventListener('moegioptions', applyTranslation);
addEventListener('lyricsready', applyTranslation);
