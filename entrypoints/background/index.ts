export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((data) => console.info('BG:', data));
  console.log('Hello background!', { id: browser.runtime.id });
  import('./translate')

  const sendOptionsToContent = debounce((tabId: number, data: MoegiOptions) => {
    console.log('forward options to content', data)
    Background.sendMessage('applyOptions', data, { tabId })
  }, 1000)

  Background.onMessage('applyOptions', async ({ data }) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      url: 'https://open.spotify.com/*',
      windowType: 'normal',
    })

    if (!tab?.id) return

    // TODO: move debouncing to storage.ts
    sendOptionsToContent(tab.id, data)
  })
});
