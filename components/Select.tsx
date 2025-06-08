import { Signal } from '@preact/signals'
import { ChangeEvent, useId } from 'preact/compat'

export interface SelectProps<T extends string> {
  label: string
  signal: Signal<string> | undefined
  default?: T,
  options: Array<{
    text: string
    value: T
  }>
}

export default function Select<T extends string>({
  label,
  signal,
  default: def,
  options,
}: SelectProps<T>) {
  const id = useId()
  const onChange = (e: ChangeEvent<HTMLSelectElement>) =>
    signal && (signal.value = e.currentTarget.value)

  return (
    <label class="grid grid-cols-2 items-center" for={id}>
      <span>{ label }:</span>
      <select
        id={id}
        class="appearance-none bg-secondary disabled:bg-secondary/50 p-1 px-2 b-1 rounded b-primary/50"
        onChange={onChange}
        defaultValue={def ?? signal?.value}
      >
        { options.map(({ text, value }) => (
          <option
            value={value}
            selected={value === signal?.value}
          >
            { text }
          </option>)
        )}
      </select>
    </label>
  )
}
