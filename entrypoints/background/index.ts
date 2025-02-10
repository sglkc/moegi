export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((data) => console.log(data));
  console.log('Hello background!', { id: browser.runtime.id });
});
