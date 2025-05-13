import ColorOptions from '../options/Color'
import RomanizationOptions from '../options/Romanization'
import TextOptions from '../options/Text'
import TranslationOptions from '../options/Translation'
import { options } from '../signal'

export default function Form() {
  const resetOptions = async () => {
    Object.assign(options, optionsStorage.fallback)
    await optionsStorage.removeValue()
  }

  return (
    <form id="form" class="grid gap-4">
      <TextOptions signal={options.fonts} />
      <ColorOptions signal={options.colors} />
      <TranslationOptions signal={options.translation} />
      <RomanizationOptions signal={options.romanization} />

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
