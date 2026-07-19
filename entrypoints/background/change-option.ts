import { DeepKeys } from '@/utils/deep-keys'
import { Background } from '@/utils/messaging'
import { MoegiOptions } from '@/utils/options'
import { diffOptionChanges } from '@/utils/options-diff'

// --- background runtime state ---
let oldOptions: MoegiOptions | undefined
let pendingChanges: DeepKeys<MoegiOptions>[] = []
let pendingOptions: MoegiOptions | undefined
let flushTimer: ReturnType<typeof setTimeout> | undefined
let flushing = false

/** Trailing debounce for tab fan-out (popup already debounces lightly). */
const FLUSH_DELAY_MS = 80

function mergeChangeKeys(
  into: DeepKeys<MoegiOptions>[],
  add: DeepKeys<MoegiOptions>[],
): void {
  for (const key of add) {
    if (!into.includes(key)) into.push(key)
  }
}

function scheduleFlush(): void {
  if (flushTimer !== undefined) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = undefined
    void runFlush()
  }, FLUSH_DELAY_MS)
}

async function runFlush(): Promise<void> {
  if (flushing) {
    // A flush is in flight; run another pass when it finishes.
    scheduleFlush()
    return
  }
  if (!pendingChanges.length || !pendingOptions) return

  flushing = true
  try {
    while (pendingChanges.length && pendingOptions) {
      const snapshot = pendingChanges
      const options = pendingOptions
      pendingChanges = []
      pendingOptions = undefined

      try {
        const tabs = await chrome.tabs.query({
          url: 'https://open.spotify.com/*',
          windowType: 'normal',
        })

        await Promise.all(
          tabs
            .filter((tab): tab is chrome.tabs.Tab & { id: number } => typeof tab.id === 'number')
            .map((tab) =>
              Background.sendMessage(
                'applyOptions',
                { changes: snapshot, options },
                { tabId: tab.id },
              ).catch((error) => {
                console.debug('applyOptions forward failed for tab', tab.id, error)
              }),
            ),
        )
      } catch (error) {
        // Re-queue so a transient failure does not permanently drop updates
        console.debug('applyOptions flush failed, re-queueing', error)
        mergeChangeKeys(pendingChanges, snapshot)
        if (!pendingOptions) pendingOptions = options
        scheduleFlush()
        break
      }
    }
  } finally {
    flushing = false
    if (pendingChanges.length && pendingOptions) scheduleFlush()
  }
}

Background.onMessage('applyOptions', ({ data: { options } }) => {
  const newChanges = diffOptionChanges(oldOptions, options)
  oldOptions = options

  if (newChanges.length === 0) return

  mergeChangeKeys(pendingChanges, newChanges)
  pendingOptions = options
  scheduleFlush()
})
