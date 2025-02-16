import { DeepSignal } from 'deepsignal'
import Range from '@/components/Range'

interface RomanizationOptionsProps {
  signal: DeepSignal<RomanizationOptions>
}

export default function RomanizationOptions({ signal }: RomanizationOptionsProps) {
  return (
    <Container label="Romanization" enabled={signal.$enabled}>
      <Select<RomanizationOptions['language']>
        label="Language"
        signal={signal.$language}
        default="any"
        options={[
          { text: 'Cyrillic', value: 'cyrillic' },
          { text: 'Chinese', value: 'chinese' },
          { text: 'Japanese', value: 'japanese' },
          { text: 'Korean', value: 'korean' },
          { text: 'Anything else', value: 'any' },
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
    </Container>
  )
}
