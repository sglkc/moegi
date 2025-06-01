import ColorOption from '../options/Color'
import RomanizationOption from '../options/Romanization'
import TextOption from '../options/Text'
import TranslationOption from '../options/Translation'
import { options } from '../signal'

export default function Form() {
  const resetOptions = async () => {
    Object.assign(options, optionsStorage.fallback)
    await optionsStorage.removeValue()
  }

  return (
    <form id="form" class="grid gap-4">
      <TextOption signal={options.fonts} />
      <ColorOption signal={options.colors} />
      <TranslationOption signal={options.translation} />
      <RomanizationOption signal={options.romanization} />

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
