import { translate } from 'google-translate-api-x';

chrome.runtime.onMessageExternal.addListener(async (message, _, res) => {
  if (message.type !== 'translate') return;

  translate(message.text, { rejectOnPartialFail: false })
    .then(res)
    .catch(console.error);
})
