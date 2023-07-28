'use strict';

function createScriptElement(options, dataset) {
  const element = document.createElement('script');

  Object.entries(options).forEach(([k, v]) => (element[k] = v));

  if (dataset)
    Object.entries(dataset).forEach(([k, v]) => (element.dataset[k] = v));

  element.type = 'text/javascript';
  element.defer = true;
  document.head.appendChild(element);

  return element;
}

// Inject dependencies then inject init script when done
const modules = new Set([
  'lib/kuroshiro@1.2.0/dist/kuroshiro.min.js',
  'lib/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js'
]);

modules.forEach((module) => createScriptElement({
  src: chrome.extension.getURL(module),
  async: true,
  onload: (e) => {
    modules.delete(e.target.dataset.name);

    if (modules.size) return;

    createScriptElement(
      { src: chrome.extension.getURL('src/web/init.js') },
      {
        dictPath: chrome.extension.getURL('lib/kuromoji@0.1.2/dict/'),
        extensionPath: chrome.extension.getURL('src/web/extension.js'),
      }
    );
  },
}, { name: module }));

// Inject default and saved options
chrome.storage.sync.get('options', (result = {}) => {
  const defaults = {
    // active: false, // This should be set to user's current setting
    to: 'romaji',
    mode: 'spaced',
    romajiSystem: 'hepburn',
    delimiter_start: '(',
    delimiter_end: ')',
    hideOriginal: false,
  };

  const options = Object.assign(
    {},
    { defaults },
    defaults,
    result.options,
  );

  chrome.storage.sync.set({ options });
  createScriptElement({
    innerText: `(() => window.__moegiOptions = ${JSON.stringify(options)})();`
  }, { moegiOptions: true });
});

// Forward runtime messages to window
chrome.runtime.onMessage.addListener((request) => {
  window.postMessage(request);
});
