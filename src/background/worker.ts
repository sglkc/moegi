import './translate'

// Enable extension action only on Spotify lyrics tabs
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable()

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    const isSpotify = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'open.spotify.com',
          },
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    }

    chrome.declarativeContent.onPageChanged.addRules([isSpotify])
  })
})
