import { DeepSignal } from 'deepsignal'
import Range from '@/components/Range'

interface TextOptionsProps {
  signal: DeepSignal<FontOptions>
}

export default function TextOptions({ signal }: TextOptionsProps) {
  return (
    <Container label="Font Style" signal={signal}>
      <Select<FontOptions['align']>
        label="Alignment"
        signal={signal.$align}
        default="left"
        options={[
          { text: 'Left', value: 'left' },
          { text: 'Center', value: 'center' },
          { text: 'Right', value: 'right' },
        ]}
      />
      <Range
        label="Font Size"
        signal={signal.$size}
        prefix="em"
        min={0.5}
        step={0.05}
        max={2.5}
      />
      <Range
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
