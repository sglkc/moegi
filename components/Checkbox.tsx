import { ComponentChildren } from 'preact'
import { Signal } from '@preact/signals'
import { useId } from 'preact/hooks'

export interface CheckboxProps {
  children?: ComponentChildren
  label?: string
  signal: Signal<boolean> | undefined
  mirror?: boolean
}

export default function Checkbox({ children, label, signal, mirror }: CheckboxProps) {
  const id = useId()
  const toggleChecked = () => signal && (signal.value = !signal.peek())

  return (
    <label class="block relative h-6 grow cursor-pointer select-none" for={id}>
      <input
        id={id}
        class="peer sr-only"
        type="checkbox"
        checked={signal}
        onChange={toggleChecked}
      />
      <span
        class={[
          'absolute inset-y-0 w-10 rounded-full bg-accent/10',
          'transition peer-checked:bg-accent/25',
          mirror ? 'right-0' : 'left-0'
        ].join(' ')}
      ></span>
      <span
        class={[
          'absolute inset-y-0 m-1 h-4 w-4 rounded-full bg-accent/50',
          'transition-all peer-checked:bg-accent',
          mirror ? 'right-4 peer-checked:right-0' : 'left-0 peer-checked:left-4'
        ].join(' ')}
      ></span>
      <span class={['absolute top-0.5', mirror ? 'left-0' : 'left-13'].join(' ')}>
        { children ?? label }
      </span>
    </label>
  )
}
