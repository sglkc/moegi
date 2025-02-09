import { render } from 'preact'
// import Form from './form'
import NotLyrics from './layouts/NotLyrics.tsx'
import NotSpotify from './layouts/NotSpotify.tsx'
import Main from './layouts/Main.tsx'
import '@fontsource/quicksand/latin-500.css'
import '@fontsource/quicksand/latin-700.css'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

// Detect if current tab is in Spotify lyrics page
chrome.tabs.query({ active: true, currentWindow: true, windowType: 'normal' })
  .then(([tab]) => {
    const tabUrlNot = (url: string) => !tab.url?.includes(url);

    const Elem = tabUrlNot('open.spotify.com')
      ? NotSpotify
      : tabUrlNot('open.spotify.com/lyrics')
        ? NotLyrics
        : () => <></>;
    // : Form

    render(<Main children={<Elem />} />, document.getElementById('root')!)
  })
