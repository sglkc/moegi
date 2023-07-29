import { ComponentChildren } from 'preact'
import { OptionsKey, options } from '@/popup/handler'

export type CheckboxProps = {
  children: ComponentChildren
  name: OptionsKey
}

export default function Checkbox({ children, name }: CheckboxProps) {
  return (
    <label
      class="my-1 flex justify-center gap-1 text-center cursor-pointer col-span-2"
      for={name}
    >
      <input
        id={name}
        type="checkbox"
        name={name}
        defaultChecked={options.value[name] as boolean}
      />
      <span>{ children }</span>
    </label>
  )
}
