'use strict';

const DEFAULT_OPTIONS = {
  active: false,
  to: 'romaji',
  mode: 'spaced',
  romajiSystem: 'hepburn',
  hideOriginal: false,
};

const form = document.getElementById('form');
const options = structuredClone(DEFAULT_OPTIONS);

// Use this to modify options
const proxy = new Proxy(options, {
  set(target, option, value) {
    target[option] = value;

    switch (option) {
      case 'active':
        document.querySelector('#status').innerText = (value ? 'ON' : 'OFF');
        break;
      case 'to':
        form.romajiSystem.disabled = (value !== 'romaji');
        break;
    }

    if (!(option in form)) return true;

    switch (form[option].type) {
      case 'radio':
      case 'checkbox':
        form[option].checked = Boolean(value);
        break;
      default:
        form[option].value = value;
    }

    return true;
  }
})

let sendMessage = null;

document.addEventListener('DOMContentLoaded', () => {
  // Get saved options and apply to options via proxy
  chrome.storage.local.get('options', (result) => {
    if (!result || !result.options) return;

    Object.entries(result.options).forEach(([k, v]) => (proxy[k] = v));
  });

  // Listen for any input change and apply to Spotify
  form.addEventListener('change', ({ target }) => {
    proxy[target.name] = target.checked ?? target.value;
    chrome.storage.local.set({ options: proxy });
    sendMessage({ options: proxy });
  });

  // Reset button
  document.getElementById('reset').addEventListener('click', ({ target }) => {
    chrome.storage.local.clear(() => {
      Object.entries(DEFAULT_OPTIONS).forEach(([k, v]) => (proxy[k] = v));
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
