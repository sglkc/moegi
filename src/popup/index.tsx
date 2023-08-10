import { render } from 'preact'
import Form from './form'
import { Main, NotLyrics, NotSpotify } from './main'
import '@fontsource/quicksand/latin-500.css'
import '@fontsource/quicksand/latin-700.css'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

// Detect if current tab is in Spotify lyrics page
chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  const Elem = !tab.url?.includes('open.spotify.com') ? NotSpotify
    : !tab.url?.includes('open.spotify.com/lyrics') ? NotLyrics
      : Form

  render(<Main children={<Elem />} />, document.getElementById('app')!)
})

