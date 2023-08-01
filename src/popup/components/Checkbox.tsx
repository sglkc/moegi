import { ComponentChildren } from 'preact'
import { MoegiOptionsKey, moegiOptions } from '@/services/options'

export type CheckboxProps = {
  children: ComponentChildren
  name: MoegiOptionsKey
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
        defaultChecked={moegiOptions.value[name] as boolean}
      />
      <span>{ children }</span>
    </label>
  )
}
