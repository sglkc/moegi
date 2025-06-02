import { DeepSignal } from 'deepsignal'
import { languages } from 'google-translate-api-x'
import Range from '@/components/Range'

interface TranslationOptionsProps {
  signal: DeepSignal<TranslationOptions>
}

const options: { text: string, value: string }[] = Object.entries(languages)
  .map(([ value, text ]) => ({ text, value }))
  .filter((el) => el.value !== 'auto')

export default function TranslationOption({ signal }: TranslationOptionsProps) {
  return (
    <Container label="Translation" signal={signal}>
      <Select
        label="Target"
        signal={signal.$target}
        default="en"
        options={options}
      />
      <Range
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
