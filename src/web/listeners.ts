import { MoegiOptions } from '@/services/options';
import { HistoryEvents } from '@/types';

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
function addHistoryListener(func: (event: HistoryEvents) => void) {
  historyEvents.forEach((event) => addEventListener(event, func));
}

// Listen for incoming messages from content script, apply to options,
// and send filtered object that has changed values
addEventListener('message', (message) => {
  if (
    typeof message.data !== 'object'
      || !message.data.type
      || message.data.type !== 'moegiOptions'
  ) return

  const options = message.data.options;
  const diff = Object.fromEntries(
    Object.entries(window.__moegiOptions).filter(
      ([key, val]) => key in options && options[key] !== val
    )
  );

  Object.assign(window.__moegiOptions, options);
  dispatchEvent(
    new CustomEvent<Partial<MoegiOptions>>('moegioptions', { detail: diff })
  );
});

export { addHistoryListener };
