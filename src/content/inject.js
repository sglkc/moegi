'use strict';

function createScriptElement(options, dataset) {
  const element = document.createElement('script');

  Object.entries(options).forEach(([k, v]) => (element[k] = v));

  if (dataset)
    Object.entries(dataset).forEach(([k, v]) => (element.dataset[k] = v));

  element.type = 'text/javascript';
  element.async = true;
  element.defer = true;
  document.head.appendChild(element);

  return element;
}

// Inject dependencies
const modules = new Set([
  'lib/kuroshiro@1.2.0/dist/kuroshiro.min.js',
  'lib/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js'
]);

modules.forEach((module) => createScriptElement({
  src: chrome.extension.getURL(module),
  onload: (e) => modules.delete(e.target.dataset.name),
}, { name: module }));

// Inject init script
createScriptElement(
  { src: chrome.extension.getURL('src/web/init.js') },
  {
    dictPath: chrome.extension.getURL('lib/kuromoji@0.1.2/dict/'),
    extensionPath: chrome.extension.getURL('src/web/extension.js'),
  }
);

// Inject saved options
chrome.storage.local.get('options', ({ options }) => {
  createScriptElement({
    innerText: `(() => window.__moegiOptions = ${JSON.stringify(options)})();`
  });
});

// Forward runtime messages to window
chrome.runtime.onMessage.addListener((request) => {
  window.postMessage(request);
  return true;
});
