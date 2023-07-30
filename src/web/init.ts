// Get saved options from extension script dataset and apply to window object
const scriptElement = document.currentScript!;
const optionsData = JSON.parse(scriptElement.dataset.moegiOptions!);

window.__moegiOptions = Object.assign({}, optionsData);
scriptElement.removeAttribute('data-moegi-options');

// Replace history state functions with a proxy that will send an event
// for every time state has changed
const historyEvents = ['changestate', 'popstate'] as const;
const historyMethods = ['pushState', 'replaceState'] as const;

historyMethods.forEach((method) => {
  history[method] = new Proxy(history[method], {
    apply(target, thisArg, args: Parameters<History['pushState']>) {
      dispatchEvent(new CustomEvent('changestate', { detail: args }));
      return target.apply(thisArg, args);
    }
  });
});

// Listen for history changes and check if user is in lyrics page
historyEvents.forEach((event) => addEventListener(event, console.log));

// Listen for incoming messages from content script and apply to options
addEventListener('message', (message) => {
  if (
    typeof message.data !== 'object'
      || !message.data.type
      || message.data.type !== 'moegiOptions'
  ) return

  Object.assign(window.__moegiOptions, message.data.options)
});
