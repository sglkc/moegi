import { ComponentChildren } from 'preact'
import { MoegiOptionsKey, moegiOptions } from '@/services/options'

export type CheckboxProps = {
  children: ComponentChildren
  name: MoegiOptionsKey
}

export default function Checkbox({ children, name }: CheckboxProps) {
  return (
    <label
      class="relative h-6 grow col-span-2 cursor-pointer"
      for={name}
    >
      <input
        id={name}
        class="peer sr-only"
        type="checkbox"
        name={name}
        defaultChecked={moegiOptions.value[name] as boolean}
      />
      <span
        class="absolute inset-0 w-10 rounded-full bg-accent/10 transition peer-checked:bg-accent/25"
      ></span>
      <span
        class="absolute inset-y-0 start-0 m-1 h-4 w-4 rounded-full bg-accent/50 transition-all peer-checked:bg-accent peer-checked:start-4"
      ></span>
      <span class="absolute left-13 top-0.5">{ children }</span>
    </label>
  )
}
