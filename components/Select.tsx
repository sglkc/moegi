import { Signal } from '@preact/signals'
import { ChangeEvent, useId } from 'preact/compat'

export interface SelectProps<T extends string> {
  label: string
  signal?: Signal<string>
  hidden?: boolean
  options: Array<{
    text: string
    value: T
  }>
}

export default function Select<T extends string>({
  label,
  signal,
  hidden,
  options,
}: SelectProps<T>) {
  const id = useId()
  const onChange = (e: ChangeEvent<HTMLSelectElement>) =>
    signal && (signal.value = e.currentTarget.value)

  return (
    <>
      <label class="py-1" for={id} hidden={hidden}>{ label }:</label>
      <select
        id={id}
        class="appearance-none bg-secondary disabled:bg-secondary/50 p-1 px-2 b-1 rounded b-primary/50"
        onChange={onChange}
      >
        { options.map(({ text, value }) => (
          <option
            value={value}
            selected={value === signal?.value}
          >
            { text }
          </option>)
        )
      }
      </select>
    </>
  )
}
