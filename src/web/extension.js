'use strict';

(() => {
  // Move lyrics from text node to paragraph element in its container
  function initLyrics() {
    lyricsElements.forEach((originalElement) => {
      if (!originalElement.firstChild) {
        lyricsElements.delete(originalElement);
        originalElement.remove();
        return;
      }

      if (originalElement.firstChild.nodeType !== 3) return;

      const lyricsElement = document.createElement('p');

      lyricsElement.innerText = originalElement.innerText;
      originalElement.replaceChildren(lyricsElement);
    });

    applyOptions();
  }

  // Apply current options
  async function applyOptions() {

    // Clear past conversions
    const convertedElements = document.querySelectorAll('.converted-lyrics');

    convertedElements.forEach((el) => el.remove());

    if (options.active) await convertLyrics();

    // Hide original element logic and scroll to active line if exists
    let activeElement = null;

    lyricsElements.forEach((lyricsElement) => {
      const [original, converted] = lyricsElement.children;

      if (options.active && options.hideOriginal && converted) {
        original.style.display = 'none';
      } else {
        original.style.display = '';
      }

      if (lyricsElement.classList.length > 2) activeElement = lyricsElement;
    });

    if (activeElement) {
      setTimeout(() => activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      }), 100);
    }
  }

  // Convert lyric lines using Kuroshiro if they have any Japanese characters
  async function convertLyrics() {
    for (const lyricsElement of lyricsElements) {
      const originalElement = lyricsElement.firstElementChild;
      const originalText = originalElement.innerText.trim();

      if (!Kuroshiro.Util.hasJapanese(originalText)) continue;

      const convertedElement = document.createElement('p');
      const convertedText = await kuroshiro.convert(originalText, options);

      convertedElement.innerHTML = convertedText;
      convertedElement.classList.add('converted-lyrics');
      lyricsElement.insertAdjacentElement('beforeend', convertedElement);
    }
  }

  // Initialize libraries
  const Kuroshiro = window.Kuroshiro.default;
  const kuroshiro = window.__kuroshiro;

  // Get saved options from window object [src/content/inject.js]
  // Then delete unused script if exist
  const options = window.__moegiOptions;

  document.querySelector('[data-moegi-options]')?.remove();

  // Get lyrics elements from Spotify using MutationObserver to detect
  // new lyrics on UI changes, use debounce function to save performance
  const lyricsSelector = '[data-testid="fullscreen-lyric"]';
  const lyricsElements = new Set(...document.querySelectorAll(lyricsSelector));

  let checkObserverMutationTimeout = null;
  const checkObserverMutation = (node) => {
    if (node.nodeName !== 'DIV') return;

    const newLyrics = Array.from(node.querySelectorAll(lyricsSelector));

    if (!newLyrics.length) return;

    clearTimeout(checkObserverMutationTimeout);

    checkObserverMutationTimeout = setTimeout(() => {
      checkObserverMutationTimeout = null;

      lyricsElements.clear();
      newLyrics.forEach((el) => lyricsElements.add(el));
      initLyrics();
    }, 500);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(checkObserverMutation);
      checkObserverMutation(mutation.target);
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });

  if (lyricsElements.size) initLyrics();

  // Apply new options on popup [src/web/init.js]
  window.addEventListener('message', (message) => {
    if (message.data && message.data.type === 'extensionPopup') applyOptions();
  });
})();
