import { LYRIC_SELECTOR } from '@/utils/constants'
import { debounce } from '@/utils/debounce'

/** Spotify / Moegi-compatible active line selectors. */
const ACTIVE_SELECTORS = [
  `${LYRIC_SELECTOR}.active-lyric`,
  `${LYRIC_SELECTOR}[aria-current="true"]`,
  `${LYRIC_SELECTOR}[data-active="true"]`,
  `.active-lyric${LYRIC_SELECTOR}`,
  `.active-lyric`,
].join(', ')

/**
 * Find the currently active lyric line inside a lyrics container.
 */
export function findActiveLyric(container: HTMLElement): HTMLElement | null {
  const direct = container.querySelector<HTMLElement>(ACTIVE_SELECTORS)
  if (direct) {
    return direct.closest(LYRIC_SELECTOR) as HTMLElement
      ?? (direct.matches(LYRIC_SELECTOR) ? direct : null)
  }

  // Fallback: any element with "active" in class that sits on a lyrics line
  for (const line of container.querySelectorAll<HTMLElement>(LYRIC_SELECTOR)) {
    if (line.classList.contains('active-lyric')) return line
    if (line.getAttribute('aria-current') === 'true') return line
    if (line.querySelector('.active-lyric, [aria-current="true"]')) return line
  }
  return null
}

/**
 * Scroll the active lyric into the center of the nearest scrollable ancestor
 * (or the container). Returns true if an active line was found and scrolled.
 */
export function scrollActiveLyricIntoView(
  container: HTMLElement,
  options: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition } = {},
): boolean {
  const active = findActiveLyric(container)
  if (!active) return false

  active.scrollIntoView({
    behavior: options.behavior ?? 'smooth',
    block: options.block ?? 'center',
    inline: 'nearest',
  })
  return true
}

export interface AutoScrollHandle {
  disconnect: () => void
  /** Force a scroll pass (e.g. after options apply). */
  refresh: () => void
}

/**
 * Watch class/aria changes on lyric lines and keep the active line in view.
 * Call disconnect when leaving lyrics / re-initing.
 */
export function startAutoScroll(
  container: HTMLElement,
  options: { enabled?: boolean; debounceMs?: number } = {},
): AutoScrollHandle {
  const enabled = options.enabled !== false
  const run = () => {
    if (!enabled) return
    scrollActiveLyricIntoView(container, { behavior: 'smooth' })
  }
  const debounced = debounce(run, options.debounceMs ?? 120)

  if (!enabled) {
    return { disconnect: () => {}, refresh: () => {} }
  }

  // Initial pass (instant so first paint lands correctly)
  scrollActiveLyricIntoView(container, { behavior: 'auto' })

  const observer = new MutationObserver(() => debounced())
  observer.observe(container, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-current', 'data-active'],
  })

  return {
    disconnect: () => {
      observer.disconnect()
    },
    refresh: () => {
      scrollActiveLyricIntoView(container, { behavior: 'auto' })
    },
  }
}

/** Single active handle so re-init / option toggles do not stack observers. */
let activeHandle: AutoScrollHandle | null = null

/**
 * Start or stop auto-scroll for a lyrics container (content-script / init).
 */
export function configureAutoScroll(container: HTMLElement, enabled: boolean): void {
  activeHandle?.disconnect()
  activeHandle = null
  if (!enabled) return
  activeHandle = startAutoScroll(container, { enabled: true })
}

export function stopAutoScroll(): void {
  activeHandle?.disconnect()
  activeHandle = null
}
