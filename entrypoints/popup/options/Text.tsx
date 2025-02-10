import { DeepSignal } from 'deepsignal'

interface TextOptionsProps {
  signal: DeepSignal<FontOptions>
}

export default function TextOptions({ signal }: TextOptionsProps) {
  return (
    <Container name="fonts" label="Font Style" enabled={signal.$enabled}>
      <div>TE</div>
    </Container>
  )
}
