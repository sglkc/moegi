import { DeepSignal } from 'deepsignal'

interface TextOptionsProps {
  signal: DeepSignal<FontOptions>
}

export default function TextOptions({ signal }: TextOptionsProps) {
  return (
    <Container label="Font Style" enabled={signal.$enabled}>
      <Select<FontOptions['align']>
        label="Alignment"
        signal={signal.$align}
        options={[
          { text: 'Left', value: 'left' },
          { text: 'Center', value: 'center' },
          { text: 'Right', value: 'right' },
        ]}
      />
    </Container>
  )
}
