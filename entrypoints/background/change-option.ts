import { updatedDiff } from 'deep-object-diff'
import { debounce } from '@/utils/debounce'
import { getDeepKeys } from '@/utils/deep-keys'
import { Background, OptionsMessage } from '@/utils/messaging'
import { MoegiOptions } from '@/utils/options'

// TODO: move debouncing to storage.ts ??
const sendOptionsToContent = debounce((tabId: number, data: OptionsMessage) => {
  console.log('Forward options to content', data.changes, data.options)
  Background.sendMessage('applyOptions', data, { tabId })
}, 500)

let oldOptions: MoegiOptions | undefined

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
  const changes = getDeepKeys(updates)
  oldOptions = options

  // Only send if there's any updates
  if (!changes.length) return

  sendOptionsToContent(tab.id, { changes, options })
})
