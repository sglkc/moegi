'use strict';

(() => {
  // Check if user is currently in lyrics page
  function checkCurrentURL(event) {
    const shouldInject = (event.type === 'pushstate')
      ? event.detail.at(-1).endsWith('/lyrics')
      : window.location.href.includes('/lyrics');

    if (shouldInject) injectExtension();
    else document.querySelector('[data-moegi-extension]')?.remove();
  }

  // Inject main extension file
  function injectExtension() {
    const element = document.createElement('script');

    element.src = document.querySelector('[data-extension-path]').dataset.extensionPath;
    element.dataset.moegiExtension = true;
    element.type = 'text/javascript';
    element.async = true;
    element.defer = true;
    document.head.appendChild(element);
  }

  // Initialize libraries and expose to window
  const Kuroshiro = window.Kuroshiro.default;
  const kuroshiro = new Kuroshiro();

  kuroshiro.init(new KuromojiAnalyzer({
    dictPath: document.querySelector('[data-dict-path]').dataset.dictPath
  }));

  window.__kuroshiro = kuroshiro;

  // Modification to window.history will send custom events to window
  const generateProxyOptions = (name) => ({
    apply(target, thisArg, argArray) {
      window.dispatchEvent(new CustomEvent(name, { detail: argArray }));
      return target.apply(thisArg, argArray);
    }
  });

  const events = ['pushstate', 'replacestate', 'popstate'];
  const methods = ['pushState', 'replaceState'];

  methods.forEach((method, i) => {
    window.history[method] = new Proxy(
      window.history[method],
      generateProxyOptions(events[i])
    );
  });

  // Listen for history changes and check if user is in lyrics page
  events.forEach((event) => window.addEventListener(event, checkCurrentURL));

  // Trigger check once on load
  checkCurrentURL({
    type: 'pushstate',
    detail: ['', null, window.location.pathname]
  });
})();
