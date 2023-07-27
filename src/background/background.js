// Enable extension action on Spotify tabs
function applyBrowserActionToTab(tab) {
  const url = new URL(tab.url);
  const action = (url.hostname === 'open.spotify.com') ? 'enable' : 'disable';

  chrome.browserAction[action](tab.id);
}

chrome.tabs.query({}, (tabs) => tabs.forEach(applyBrowserActionToTab));
chrome.tabs.onUpdated.addListener((_1, _2, tab) => applyBrowserActionToTab(tab));
