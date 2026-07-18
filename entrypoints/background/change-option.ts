import { updatedDiff } from 'deep-object-diff'
import { debounce } from '@/utils/debounce'
import { getDeepKeys } from '@/utils/deep-keys'
import { Background, OptionsMessage } from '@/utils/messaging'
import { MoegiOptions } from '@/utils/options'

// store multiple changes across rapid updates
let changes: OptionsMessage['changes'] = []
let oldOptions: MoegiOptions | undefined
let pendingOptions: MoegiOptions | undefined

const flushOptionsToTabs = debounce(async () => {
  if (!changes.length || !pendingOptions) return

  const snapshot = changes
  const options = pendingOptions
  changes = []
  pendingOptions = undefined

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
          // Tab may have closed or lack the content script yet
          console.debug('applyOptions forward failed for tab', tab.id, error)
        }),
      ),
  )
}, 500)

Background.onMessage('applyOptions', async ({ data: { options } }) => {
  // First message seeds the baseline before diffing
  if (!oldOptions) {
    oldOptions = options
  }

  const updates = updatedDiff(oldOptions, options)
  const newChanges = getDeepKeys(updates)

  for (const change of newChanges) {
    if (changes.includes(change)) continue
    changes.push(change)
  }

  oldOptions = options
  pendingOptions = options

  void flushOptionsToTabs()
})
