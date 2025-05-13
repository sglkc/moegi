import { Signal } from '@preact/signals'
import { DeepSignal, RevertDeepSignal } from 'deepsignal'
import { memo } from 'preact/compat'
import { Dispatch, StateUpdater, useCallback, useRef, useState } from 'preact/hooks'
import { HexAlphaColorPicker } from 'react-colorful'

interface ColorOptionsProps {
  signal: DeepSignal<ColorOptions>
}

interface ColorLabelProps {
  label: string
  onClick: () => void
}

type InputLabel = keyof ColorOptions

const ColorLabel = memo(({ label, onClick }: ColorLabelProps) => {
  console.log('rerender')
  return (
    <button class="cursor-pointer" onClick={onClick} type="button">
      <div class="text-center">{ label }</div>
      <div class="px-4 py-2 b-1 rounded"></div>
    </button>
  )
})

export default function ColorOptions({ signal }: ColorOptionsProps) {
  const [label, setLabel] = useState<InputLabel | false>(false)
  const labelSignal = useRef<Signal>()

  const onClick = useCallback((label: InputLabel) => () => {
    labelSignal.current = signal[`$${label}`]
    setLabel(label)
  }, [])

  const resetColor = () => labelSignal.current && (labelSignal.current.value = '')

  const changeColor = (color: string) =>
    labelSignal.current && (labelSignal.current.value = color)

  return (
    <Container label="Color Style" signal={signal}>
      <div class="grid grid-cols-2 gap-2">
        <ColorLabel label="Background" onClick={onClick('background')} />
        <ColorLabel label="Passed" onClick={onClick('passed')} />
        <ColorLabel label="Active" onClick={onClick('active')} />
        <ColorLabel label="Inactive" onClick={onClick('inactive')} />
        <ColorLabel label="Translation" onClick={onClick('translation')} />
        <ColorLabel label="Romanization" onClick={onClick('romanization')} />
      </div>
      { label &&
        <div class="flex flex-col items-center gap-1 col-span-2 text-center">
          <div class="flex gap-8">
            <button
              class="color-accent underline cursor-pointer"
              onClick={resetColor}
            >
              [SET TO DEFAULT]
            </button>
            <button
              class="color-accent underline cursor-pointer"
              onClick={() => setLabel(false)}
            >
              [CLOSE]
            </button>
          </div>
          <p>
            Picking color for <strong>{ label }</strong>:
          </p>
          <HexAlphaColorPicker
            color={labelSignal.current?.value}
            onChange={changeColor}
          />
        </div>
      }
    </Container>
  )
}
