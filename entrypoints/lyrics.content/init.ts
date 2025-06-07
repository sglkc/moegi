import lyricsAutoScroll from './auto-scroll'
import romanize from './romanization'
import lyricsStyling from './styling'

export default async function lyricsInit() {
  const lyricElements = new Set<HTMLElement>()

  const toastId = await Content.sendMessage('createToast', {
    text: 'Processing lyrics...'
  })

  const elements = document.querySelectorAll(LYRIC_SELECTOR)
  const lyrics = Array.from(elements) as HTMLElement[]

  if (lyrics.length === 0) {
    await Content.sendMessage('createToast', {
      text: 'No lyrics found',
      duration: 1000
    })
    return
  }

  // Clear previous elements and add new ones
  lyricElements.clear()

  for (const lyric of lyrics) {
    lyricElements.add(lyric)
    processLyricElement(lyric)
  }

  await Content.sendMessage('destroyToast', toastId)
  await Content.sendMessage('createToast', {
    text: `Found ${lyrics.length} lyric lines!`,
    duration: 1000
  })

  // Get latest options to apply on first open
  const storedOptions: MoegiOptions = JSON.parse(sessionStorage.getItem('moegi_options')!)

  // TODO: add auto scroll toggle
  lyricsAutoScroll()
  lyricsStyling(storedOptions)
}

function processLyricElement(element: HTMLElement): void {
  if (element.hasAttribute('data-moegi-processed')) return

  element.setAttribute('data-moegi-processed', 'true')

  const originalLyric = element.textContent?.trim() || ''

  if (!originalLyric) return

  // Create containers for different lyric types
  const originalElement = document.createElement('p')
  originalElement.className = ORIGINAL_LYRIC
  originalElement.textContent = originalLyric

  const romanizedElement = document.createElement('p')
  romanizedElement.className = ROMANIZED_LYRIC
  romanizedElement.textContent = romanize(originalLyric)

  const translatedElement = document.createElement('p')
  translatedElement.className = TRANSLATED_LYRIC

  // Add all elements to the container
  element.replaceChildren(
    originalElement,
    romanizedElement,
    translatedElement
  )
}
