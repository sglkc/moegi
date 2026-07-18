import ColorOption from '@/components/options/Color'
import FontOption from '@/components/options/Font'
import RomanizationOption from '@/components/options/Romanization'
import TranslationOption from '@/components/options/Translation'
import { options, resetOptionsToDefaults } from '@/utils/storage'

export default function Form() {
  const resetOptions = async () => {
    await resetOptionsToDefaults()
  }

  return (
    <form id="form" class="grid gap-4">
      <FontOption signal={options.fonts} />
      <ColorOption signal={options.colors} />
      <TranslationOption signal={options.translation} />
      <RomanizationOption signal={options.romanization} />

      <button
        id="reset"
        class="mt-2 p-2 bg-accent color-light text-bold rounded cursor-pointer"
        type="button"
        onClick={resetOptions}
      >
        Reset to defaults
      </button>
    </form>
  )
}
