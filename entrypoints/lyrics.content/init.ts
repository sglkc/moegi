import { clearLyricsCache } from './cache'
import lyricsObserver from './observer'
import { processLyricElement } from './process-lyric'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { LYRIC_SELECTOR } from '@/utils/constants'
import { Content } from '@/utils/messaging'
import { optionsStorage } from '@/utils/storage'

export default async function lyricsInit(container: HTMLElement) {
  // Fresh song/container: drop previous HTML snapshots
  clearLyricsCache()

  // There are a couple of empty lines from Spotify
  const lyrics = container.querySelectorAll<HTMLDivElement>(`${LYRIC_SELECTOR}:has( > :not(:empty))`)

  if (lyrics.length === 0) return

  const toastId = await Content.sendMessage('createToast', {
    text: 'Processing lyrics...'
  })

  for (const lyric of lyrics) {
    processLyricElement(lyric)
  }

  await Content.sendMessage('destroyToast', toastId)
  await Content.sendMessage('createToast', {
    text: `Found ${lyrics.length} lyric lines!`,
    duration: 1000
  })

  // Get latest options to apply on first open
  const storedOptions = await optionsStorage.getValue()

  // TODO: add auto scroll toggle
  lyricsObserver(container)
  lyricsStyling(storedOptions)
  lyricsRomanization(lyrics, storedOptions.romanization)
  lyricsTranslation(lyrics, storedOptions.translation)
}
