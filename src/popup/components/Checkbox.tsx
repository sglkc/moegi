import { ComponentChildren } from 'preact'

export type CheckboxProps = {
  children: ComponentChildren
  name: string
}

export default function Checkbox({ children, name }: CheckboxProps) {
  return (
    <label
      class="my-1 flex justify-center gap-1 text-center cursor-pointer col-span-2"
      for={name}
    >
      <input id={name} type="checkbox" name={name} />
      <span>{ children }</span>
    </label>
  )
}
