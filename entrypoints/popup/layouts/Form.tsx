import { effect } from '@preact/signals'
import { deepSignal } from 'deepsignal'
import TextOptions from '../options/Text'

// Make options reactive and save to storage on every change
const options = deepSignal(await optionsStorage.getValue())

// TODO: diff changes?
effect(() => {
  console.log('form signal change', options)
  optionsStorage.setValue(options)
  chrome.runtime.sendMessage(options)
})

export default function Form() {
  const resetOptions = async () => {
    Object.assign(options, optionsStorage.fallback)
    await optionsStorage.removeValue()
  }

  return (
    <form id="form" class="flex flex-col gap-2">
      <TextOptions signal={options.fonts} />

      <button
        id="reset"
        class="mt-2 p-2 bg-accent color-light text-bold rounded"
        type="button"
        onClick={resetOptions}
      >
        Reset to defaults
      </button>
    </form>
  )
}
