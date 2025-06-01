export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((data) => console.info('BG:', data));
  console.log('Hello background!', { id: browser.runtime.id });
});
