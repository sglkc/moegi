import { translate } from 'google-translate-api-x';

chrome.runtime.onMessageExternal.addListener((message, _, res) => {
  if (message.type !== 'translate') return;

  translate(message.text, {
    fallbackBatch: false,
    forceBatch: false
  })
    .then(res);
})
