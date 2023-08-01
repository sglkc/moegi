import { MoegiOptions } from '@/services/options';
import { HistoryEvents } from '@/types';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// Get saved options from extension script dataset and apply to window object
const scriptElement = document
  .querySelector<HTMLScriptElement>('[data-moegi-options]')!;
const optionsData = JSON.parse(scriptElement.dataset.moegiOptions!);

window.__moegiOptions = Object.assign({}, optionsData);
scriptElement.removeAttribute('data-moegi-options');

const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer({
  dictPath: scriptElement.dataset.dictPath!
});

kuroshiro.init(kuromojiAnalyzer).then(() => import('./romanization'));
scriptElement.removeAttribute('data-dict-path');

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

export { addHistoryListener, kuroshiro };
