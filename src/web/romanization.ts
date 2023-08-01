import { HistoryChangeEvent } from '@/types';
import { addHistoryListener, kuroshiro } from './init';

const options = window.__moegiOptions;

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

async function applyOptions() {

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
const lyricElementSelector = '[data-testid="fullscreen-lyric"]';
const lyricElements: Set<HTMLDivElement> = new Set(
  Array.from(document.querySelectorAll(lyricElementSelector))
);

// Move lyrics from text node to paragraph element in the container
function initLyrics() {
  lyricElements.forEach((originalElement) => {
    if (!originalElement.firstChild) {
      lyricElements.delete(originalElement);
      originalElement.remove();
      return;
    }

    if (originalElement.firstChild.nodeType !== Node.TEXT_NODE) return;

    const lyricsElement = document.createElement('p');

    lyricsElement.innerText = originalElement.innerText;
    originalElement.replaceChildren(lyricsElement);
  });

  applyOptions();
}

// If user's already in lyrics page and lyric elements exist in first try,
// initialize lyrics immediately
if (location.pathname.includes('lyrics') || lyricElements.size) initLyrics();

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

// Apply romanization if current url is /lyrics
addHistoryListener((event) => {
  const isLyricsPage = (event.type === 'pushstate')
    ? (event as HistoryChangeEvent).detail[2]?.toString().includes('lyrics')
    : location.pathname.includes('lyrics');

  if (isLyricsPage) initLyrics();
});

// Apply new options on popup message
addEventListener('message', (message) => {
  if (
    typeof message.data !== 'object'
      || !message.data.type
      || message.data.type !== 'moegiOptions'
  ) return;

  applyOptions();
});
