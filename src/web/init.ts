import { MoegiOptions } from '@/services/options';
import { HistoryChangeEvent } from '@/types';
import { addHistoryListener } from './listeners';
import './toast';
import createToast from './toast';

// Module imports are below to avoid export not defined errors

// Get saved options from extension script dataset and apply to window object
const scriptElement = document
  .querySelector<HTMLScriptElement>('[data-moegi-script]')!;
const optionsData = JSON.parse(scriptElement.dataset.moegiOptions!);

window.__moegiOptions = Object.assign({}, optionsData);
scriptElement.removeAttribute('data-moegi-options');

const options: MoegiOptions = window.__moegiOptions;

// Move lyrics from text node to paragraph element in the container
function initLyrics() {
  lyricElements.forEach((originalElement) => {

    // There are empty lyric elements from Spotify, if any are removed Spotify
    // will happen to error on the next song load
    if (!originalElement.firstChild)
      return lyricElements.delete(originalElement);

    // If element lyric is already moved to paragraph element
    if (originalElement.firstChild.nodeType !== Node.TEXT_NODE) return;

    // Initialize paragraph elements for romanization and translation
    const lyricsElement = document.createElement('p');
    lyricsElement.innerText = originalElement.innerText;
    lyricsElement.classList.add('original-lyrics');

    const convertedElement = document.createElement('p');
    convertedElement.classList.add('converted-lyrics');

    const translatedElement = document.createElement('p');
    translatedElement.classList.add('translated-lyrics');

    originalElement.replaceChildren(
      lyricsElement,
      convertedElement,
      translatedElement
    );
  });

  createToast('Lyrics loaded', 3000).showToast();
  dispatchEvent(new CustomEvent('lyricsready'));
}

const lyricElementSelector = '[data-testid="fullscreen-lyric"]';
const lyricElements = new Set<HTMLDivElement>(
  Array.from(document.querySelectorAll(lyricElementSelector))
);

// Setup observer to detect lyrics elements on slow network or UI changes
// use debounce to prevent performance leak
let checkLyricsMutationTimeout: ReturnType<Window['setTimeout']> | undefined;

function checkLyricsMutation(node: Node) {
  if (node.nodeName !== 'DIV') return;

  const newLyrics: HTMLDivElement[] = Array.from(
    (node as Element).querySelectorAll(lyricElementSelector)
  );

  if (!newLyrics.length) return;

  clearTimeout(checkLyricsMutationTimeout);

  checkLyricsMutationTimeout = (setTimeout as Window['setTimeout'])(() => {
    checkLyricsMutationTimeout = undefined;

    lyricElements.clear();
    newLyrics.forEach((el) => lyricElements.add(el));
    initLyrics();
  }, 500);
}

const lyricsObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(checkLyricsMutation);
    checkLyricsMutation(mutation.target);
  }
});

lyricsObserver.observe(document.body, { subtree: true, childList: true });

// Scroll to active lyric line after DOM modifications
// There are 2 default classes for default lyrics so if more then its active
function scrollToActiveLyric() {
  const activeElement = Array.from(lyricElements)
    .reverse()
    .find((lyricElement) => lyricElement.classList.length > 2);

  if (activeElement) setTimeout(() => activeElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  }), 100);
}

// Initialize lyrics if current url is /lyrics
addHistoryListener((event) => {
  const isLyricsPage = (event.type === 'pushstate')
    ? (event as HistoryChangeEvent).detail[2]?.toString().includes('lyrics')
    : location.pathname.includes('lyrics');

  if (isLyricsPage) initLyrics();
});

// If user's already in lyrics page and lyric elements exist in first try,
// initialize lyrics immediately
if (location.pathname.includes('lyrics') && lyricElements.size) initLyrics();

// Use dynamic import so it doesn't bundle to the top
import('./styling');
import('./romanization');
import('./translation');

export { lyricElements, options, scriptElement, scrollToActiveLyric };
