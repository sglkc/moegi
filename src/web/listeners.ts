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

// Listen for incoming messages from content script and apply to options
addEventListener('message', (message) => {
  if (
    typeof message.data !== 'object'
      || !message.data.type
      || message.data.type !== 'moegiOptions'
  ) return

  Object.assign(window.__moegiOptions, message.data.options);
  dispatchEvent(
    new CustomEvent<MoegiOptions>('moegioptions', {
      detail: message.data.options
    })
  );
});

export { addHistoryListener };
