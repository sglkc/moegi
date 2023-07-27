'use strict';

(() => {
  // Move lyric text from container element to child node,
  // and scroll to active line if found
  function initLyrics() {
    lyricsElements.forEach((originalElement) => {
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

    setTimeout(() => activeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    }), 100);
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

  // Get lyrics elements from Spotify
  // if haven't loaded then use MutationObserver to detect DOM changes
  const lyricsSelector = '[data-testid="fullscreen-lyric"]';
  const lyricsElements = Array.from(document.querySelectorAll(lyricsSelector));

  if (!lyricsElements.length) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName !== 'DIV') return;

          lyricsElements.splice(0, 0, ...node.querySelectorAll(lyricsSelector));

          if (!lyricsElements.length) return;

          initLyrics();
          observer.disconnect();
        });
      }
    });

    observer.observe(document.body, { subtree: true, childList: true });
  } else {
    initLyrics();
  }

  // Listen for messages from extension popup
  window.addEventListener('message', (message) => {
    const { data } = message;

    if ((typeof data !== 'object') || !('type' in data)) return;

    Object.assign(options, data.options);
    applyOptions();
  });
})();
