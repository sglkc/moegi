'use strict';

{
  // Check if user is currently in lyrics page
  function checkCurrentURL() {
    if (window.location.href.includes('/lyrics')) {
      injectExtension();
    } else {
      document.querySelector('[data-moegi-extension]')?.remove();
    };
  }

  // Inject main extension file
  function injectExtension() {
    const element = document.createElement('script');

    element.src = document.querySelector('[data-extension-path]').dataset.extensionPath;
    element.type = 'text/javascript';
    element.async = true;
    element.defer = true;
    element.dataset.moegiExtension = true;
    document.head.appendChild(element);
  }

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
  checkCurrentURL();
}
