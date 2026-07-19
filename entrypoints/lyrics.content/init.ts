import { configureAutoScroll } from './auto-scroll'
import { clearLyricsCache } from './cache'
import lyricsObserver from './observer'
import { processLyricElement } from './process-lyric'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { LYRIC_SELECTOR } from '@/utils/constants'
import { Content } from '@/utils/messaging'
import { MoegiOptions } from '@/utils/options'
import { optionsStorage } from '@/utils/storage'

export interface LyricsInitDeps {
  clearCache: typeof clearLyricsCache
  processLine: typeof processLyricElement
  observe: typeof lyricsObserver
  styling: typeof lyricsStyling
  romanization: typeof lyricsRomanization
  translation: typeof lyricsTranslation
  getOptions: () => Promise<MoegiOptions>
  createToast: (data: { text: string, duration?: number }) => Promise<number>
  destroyToast: (id: number) => Promise<boolean>
  autoScroll: (container: HTMLElement, enabled: boolean) => void
}

const defaultDeps = (): LyricsInitDeps => ({
  clearCache: clearLyricsCache,
  processLine: processLyricElement,
  observe: lyricsObserver,
  styling: lyricsStyling,
  romanization: lyricsRomanization,
  translation: lyricsTranslation,
  getOptions: () => optionsStorage.getValue(),
  createToast: (data) => Content.sendMessage('createToast', data),
  destroyToast: (id) => Content.sendMessage('destroyToast', id),
  autoScroll: configureAutoScroll,
})

/**
 * High-level lyrics open flow: process lines, toast, apply stored options.
 * Deps are injectable for offline feature tests.
 */
export default async function lyricsInit(
  container: HTMLElement,
  deps: LyricsInitDeps = defaultDeps(),
): Promise<void> {
  deps.clearCache()

  // Skip empty Spotify placeholder lines (avoid :has() for broader engine support)
  const lyrics = [...container.querySelectorAll<HTMLDivElement>(LYRIC_SELECTOR)]
    .filter((el) => Boolean(el.textContent?.trim()))

  if (lyrics.length === 0) return

  const toastId = await deps.createToast({
    text: 'Processing lyrics...',
  })

  for (const lyric of lyrics) {
    deps.processLine(lyric)
  }

  await deps.destroyToast(toastId)
  await deps.createToast({
    text: `Found ${lyrics.length} lyric lines!`,
    duration: 1000,
  })

  const storedOptions = await deps.getOptions()

  deps.observe(container)
  deps.styling(storedOptions)
  // Missing field on older stored profiles → default on (product default)
  deps.autoScroll(container, storedOptions.fonts.autoScroll ?? true)
  void deps.romanization(lyrics, storedOptions.romanization)
  void deps.translation(lyrics, storedOptions.translation)
}
