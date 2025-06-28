import { updatedDiff } from 'deep-object-diff'
import { debounce } from '@/utils/debounce'
import { getDeepKeys } from '@/utils/deep-keys'
import { Background, OptionsMessage } from '@/utils/messaging'
import { MoegiOptions } from '@/utils/options'

// store multiple changes
let changes: OptionsMessage['changes'] = []
let oldOptions: MoegiOptions | undefined

const sendOptionsToContent = debounce((tabId: number, options: MoegiOptions) => {
  if (!changes.length) return

  Background.sendMessage('applyOptions', { changes, options }, { tabId })
  console.log('Forward options to content', changes, options)
  changes = []
}, 500)

Background.onMessage('applyOptions', async ({ data: { options } }) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    url: 'https://open.spotify.com/*',
    windowType: 'normal',
  })

  if (!tab?.id) return

  // set first option before diffing
  // applyOptions messages from background always return complete data
  if (!oldOptions)
    oldOptions = options

  // get updated keys then update old data
  const updates = updatedDiff(oldOptions, options)
  const newChanges = getDeepKeys(updates)

  // merge with old changes
  for (const change of newChanges) {
    if (changes.includes(change)) continue
    changes.push(change)
  }

  oldOptions = options

  sendOptionsToContent(tab.id, options)
})
