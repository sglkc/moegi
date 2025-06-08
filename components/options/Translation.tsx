import { DeepSignal } from 'deepsignal'
import { languages } from 'google-translate-api-x'
import Container from '@/components/Container'
import Select from '@/components/Select'
import Slider from '@/components/Slider'
import { TranslationOptions } from '@/utils/options'

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
        options={options}
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
