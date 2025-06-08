import ColorOption from '@/components/options/Color'
import RomanizationOption from '@/components/options/Romanization'
import FontOption from '@/components/options/Font'
import TranslationOption from '@/components/options/Translation'
import { options, optionsStorage } from '@/utils/storage'

export default function Form() {
  const resetOptions = async () => {
    Object.assign(options, optionsStorage.fallback)
    await optionsStorage.setValue(optionsStorage.fallback)
    location.reload()
  }

  return (
    <form id="form" class="grid gap-4">
      <FontOption signal={options.fonts} />
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
