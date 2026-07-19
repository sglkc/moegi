import { DeepSignal } from 'deepsignal'
import Checkbox from '@/components/Checkbox'
import Container from '@/components/Container'
import Select from '@/components/Select'
import Slider from '@/components/Slider'
import { FontOptions } from '@/utils/options'

interface TextOptionsProps {
  signal: DeepSignal<FontOptions>
}

export default function FontOption({ signal }: TextOptionsProps) {
  return (
    <Container label="Font Style" signal={signal}>
      <Select<FontOptions['align']>
        label="Alignment"
        signal={signal.$align}
        options={[
          { text: 'Left', value: 'left' },
          { text: 'Center', value: 'center' },
          { text: 'Right', value: 'right' },
        ]}
      />
      <Slider
        label="Font Size"
        signal={signal.$size}
        prefix="em"
        min={0.5}
        step={0.05}
        max={2.5}
      />
      <Slider
        label="Spacing"
        signal={signal.$spacing}
        prefix="px"
        max={64}
      />
      <Checkbox
        label="Hide Original Lyrics"
        signal={signal.$hideOriginal}
        mirror
      />
    </Container>
  )
}
