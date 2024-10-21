import { Dispatch, StateUpdater, useState } from 'preact/hooks'
import { HexAlphaColorPicker } from 'react-colorful'
import { MoegiOptionsKey, moegiOptions } from '@/services/options'

type InputType = undefined | typeof styleProps[number]['name']

const styleProps = [
  { label: 'Background', name: 'lyrics_background' },
  { label: 'Active', name: 'lyrics_active' },
  { label: 'Inactive', name: 'lyrics_inactive' },
  { label: 'Passed', name: 'lyrics_passed' },
] as const

type ColorLabelProps = typeof styleProps[number] & {
  current: InputType
  set: Dispatch<StateUpdater<InputType>>
}

function ColorLabel({ current, label, name, set }: ColorLabelProps) {
  const color = moegiOptions.value[name]

  return (
    <label
      class="cursor-pointer"
      for={name}
      onClick={() => set((current === name) ? undefined : name)}
    >
      <input type="hidden" id={name} name={name} value={color} />
      <div class="text-center">{ label }</div>
      <div class="px-4 py-2 rounded" style={`background-color: ${color}`}></div>
    </label>
  )
}

export type ColorProps = {
  name: MoegiOptionsKey
  label: string
}

export default function Color() {
  const [input, setInput] = useState<InputType>()

  return (
    <>
      <p class="mt-2 col-span-2 text-center">Colors</p>
      { styleProps.map((props) => (
        <ColorLabel current={input} set={setInput} {...props} />
      ))}
      { input &&
        <div class="flex flex-col items-center gap-1 col-span-2 text-center">
          <button
            class="color-accent underline cursor-pointer"
            onClick={() => setInput(undefined)}
          >
            [CLOSE]
          </button>
          <p>
            Picking color for {' '}
            <strong>
              { styleProps.find(({ name }) => name === input)?.label }
            </strong>:
          </p>
          <HexAlphaColorPicker
            color={moegiOptions.value[input]}
            onChange={(val) => {
              const elm = document.querySelector<HTMLInputElement>('#' + input)!
              elm.value = val
              elm.dispatchEvent(new Event('input', { bubbles: true }))
            }
            }
          />
        </div>
      }
    </>
  )
}
