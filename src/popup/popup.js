'use strict';

const form = document.getElementById('form');
const options = {};
let sendMessage = (data) => console.error('sendMessage not available yet', data);

// Intercept access to original options Object and send updated options
const proxy = new Proxy(options, {
  set(target, option, value) {
    const inputs = form.elements;

    target[option] = value;

    // Handle different type of options
    switch (option) {
      case 'active':
        document.querySelector('#status').innerText = (value ? 'ON' : 'OFF');
        break;
      case 'to':
        inputs.romajiSystem.disabled = (value !== 'romaji');
        break;
      case 'mode':
        inputs.delimiter_start.disabled = (value !== 'okurigana');
        inputs.delimiter_end.disabled = (value !== 'okurigana');
        break;
    }
        console.log(option, value)

    // Handle different type of inputs
    switch (inputs[option]?.type) {
      case undefined:
        break;
      case 'radio':
      case 'checkbox':
        inputs[option].checked = Boolean(value);
        break;
      default:
        inputs[option].value = value ?? '';
    }

    return true;
  }
})

// Get saved options and apply to options via proxy
chrome.storage.sync.get('options', (result) => {
  if (!result || !result.options) return;
  Object.entries(result.options).forEach(([k, v]) => (proxy[k] = v));
});

// Listen for any input change with debounce function and apply to Spotify
let formEventHandlerTimeout = null;
const formEventHandler = ({ target }) => {
  proxy[target.name] = (target.type === 'checkbox')
    ? target.checked
    : target.value;

  clearTimeout(formEventHandlerTimeout);

  formEventHandlerTimeout = setTimeout(() => {
    formEventHandlerTimeout = null;

    chrome.storage.sync.set({ options: proxy });
    sendMessage({ options: proxy });
  }, 100);
}

form.addEventListener('change', formEventHandler);
form.addEventListener('input', formEventHandler);

// Reset button and options except for active
document.getElementById('reset').addEventListener('click', ({ target }) => {
  const defaults = structuredClone(options.defaults);

  Object.entries(defaults)
    .concat([['active', options.active]])
    .forEach(([k, v]) => (proxy[k] = v));

  chrome.storage.sync.clear(() => {
    chrome.storage.sync.set({ options: proxy }, () => {
      proxy.defaults = defaults;
      target.innerText = 'Options reset';
      sendMessage({ options: proxy });
    });
  });
});

// Get sendMessage method to Spotify tab
chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
  sendMessage = (data) => chrome.tabs.sendMessage(id, {
    type: 'extensionPopup',
    ...data
  });
});
