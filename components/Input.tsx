import { Signal } from '@preact/signals'
import { InputHTMLAttributes } from 'preact/compat'
import { useId } from 'preact/hooks'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onInput'> {
  label: string
  signal: Signal<string> | undefined
}

export default function Input({ label, signal, ...props }: InputProps) {
  const id = useId()
  const onInput = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement
    signal && (signal.value = target.value)
  }

  return (
    <div>
      <label class="py-1 text-center block" for={id}>{ label }:</label>
      <input
        id={id}
        class="appearance-none bg-secondary disabled:bg-secondary/50 p-1 px-2 b-1 rounded b-primary/50 disabled:color-text/50 w-full"
        type="text"
        value={signal?.value}
        onInput={onInput}
        {...props}
      />
    </div>
  )
}
