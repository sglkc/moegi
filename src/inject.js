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

function injectExtension() {
  chrome.storage.local.get('options', ({ options }) => {
    createScriptElement({
      innerText: `(() => window.__moegiOptions = ${JSON.stringify(options)})();`
    });

    createScriptElement(
      { src: chrome.extension.getURL('src/extension.js') },
      { dictPath: chrome.extension.getURL('lib/kuromoji@0.1.2/dict/') }
    );
  });
}

function injectModules() {
  const modules = new Set([
    'lib/kuroshiro@1.2.0/dist/kuroshiro.min.js',
    'lib/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js'
  ]);

  const moduleLoaded = (e) => {
    modules.delete(e.target.dataset.name);
    if (!modules.size) injectExtension();
  }

  modules.forEach((module) => createScriptElement({
    src: chrome.extension.getURL(module),
    onload: moduleLoaded,
  }, { name: module }));
}

chrome.runtime.onMessage.addListener((request) => {
  window.postMessage(request);
  return true;
});

injectModules();
