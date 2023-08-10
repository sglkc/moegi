import { PropsWithChildren } from 'preact/compat'
import moegiText from '@/assets/moegi-text.svg'

export function Main({ children }: PropsWithChildren) {
  return (
    <main class="p-4 min-w-72 bg-background color-text text-sm font-text fw-500">
      <div class="mb-4 flex justify-between items-center">
        <img class="max-h-8" src={moegiText} alt="もえぎ" />
        <p class="max-w-32 line-height-4 text-end">
          <small class="text-xs">Spotify lyrics utility extension</small>
        </p>
      </div>
      { children }
    </main>
  )
}

function openSpotify() {
  chrome.tabs.create({ active: true, url: 'https://open.spotify.com' })
}

export function NotSpotify() {
  return (
    <div class="flex flex-col gap-2">
      <h1>
        <strong>
          Looks like you don't have Spotify opened in the current tab :/
        </strong>
      </h1>
      <a class="underline text-accent cursor-pointer" onClick={openSpotify}>
        Open Spotify Web Player
      </a>
    </div>
  )
}

export function NotLyrics() {
  return (
    <div class="flex flex-col gap-2">
      <h1>
        <strong>
          Open the lyrics page (microphone icon at the bottom-right) to get
          started!
        </strong>
      </h1>
      <p>If you don't see it, then the song you choose doesn't have lyrics.</p>
    </div>
  )
}
