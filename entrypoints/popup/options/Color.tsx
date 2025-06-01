import { debounce } from '@/utils/debounce'
import { Signal } from '@preact/signals'
import { DeepSignal, RevertDeepSignal } from 'deepsignal'
import { memo } from 'preact/compat'
import { Dispatch, StateUpdater, useCallback, useRef, useState } from 'preact/hooks'
import { HexAlphaColorPicker } from 'react-colorful'

interface ColorOptionsProps {
  signal: DeepSignal<ColorOptions>
}

interface ColorLabelProps {
  color?: string
  label: string
  onClick: () => void
}

type InputLabel = keyof ColorOptions

export default function ColorOption({ signal }: ColorOptionsProps) {
  const [label, setLabel] = useState<InputLabel | false>(false)
  const labelSignal = useRef<Signal>()

  const onClick = useCallback((label: InputLabel) => () => {
    labelSignal.current = signal[`$${label}`]
    setLabel(label)
  }, [])

  const resetColor = () => labelSignal.current && (labelSignal.current.value = '')

  const changeColor = debounce((color: string) =>
    labelSignal.current && (labelSignal.current.value = color), 500)

  const colorLabels = [
    { label: 'Background', color: signal.background },
    { label: 'Passed', color: signal.passed },
    { label: 'Active', color: signal.active },
    { label: 'Inactive', color: signal.inactive },
    { label: 'Translation', color: signal.translation },
    { label: 'Romanization', color: signal.romanization },
  ]

  const ColorLabel = memo(({ color, label }: ColorLabelProps) => {
    console.log('rerender')
    return (
      <button
        class="cursor-pointer appearance-none bg-secondary py-1 px-2 b-1 rounded b-primary/60"
        onClick={onClick(label.toLowerCase() as InputLabel)}
        type="button"
      >
        <div class="mb-1 text-center">{ label }</div>
        <div class="px-4 py-2 b-1 b-gray/50 rounded" style={{ background: color }}></div>
      </button>
    )
  })

  return (
    <Container label="Color Style" signal={signal}>
      <div class="grid grid-cols-2 gap-4 col-span-2">
        { colorLabels.map(({ label, color }) => (
          <ColorLabel
            key={label}
            label={label}
            color={color}
            onClick={onClick(label.toLowerCase() as InputLabel)}
          />
        ))}
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
