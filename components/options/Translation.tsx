import { SUPPORTED_LANGUAGES } from '@deeplx/core'
import { DeepSignal } from 'deepsignal'
import { languages as GOOGLE_LANGUAGES } from 'google-translate-api-x'
import Container from '@/components/Container'
import Select, { SelectProps } from '@/components/Select'
import Slider from '@/components/Slider'
import { TranslationOptions } from '@/utils/options'

interface TranslationOptionsProps {
  signal: DeepSignal<TranslationOptions>
}

const languages: Record<TranslationOptions['provider'], SelectProps<string>['options']> = {
  google: Object.entries(GOOGLE_LANGUAGES)
    .map(([ value, text ]) => ({ text, value }))
    .filter((el) => el.value !== 'auto'),

  deepl: (SUPPORTED_LANGUAGES)
    .map(({ code, language }) => ({ text: language, value: code.toLowerCase() }))
}

export default function TranslationOption({ signal }: TranslationOptionsProps) {
  return (
    <Container label="Translation" signal={signal}>
      <Select
        label="Provider"
        signal={signal.$provider}
        options={[
          { text: 'Google', value: 'google' },
          { text: 'DeepL', value: 'deepl' },
        ]}
      />
      { signal.provider === 'deepl' &&
        <Select
          label="From"
          signal={signal.$from}
          options={languages['deepl']}
        />
      }
      <Select
        label="Target"
        signal={signal.$target}
        options={languages[signal.provider ?? 'google']}
      />
      <Slider
        label="Font Size"
        signal={signal.$size}
        prefix="em"
        min={0.5}
        step={0.05}
        max={2.5}
      />
    </Container>
  )
}
