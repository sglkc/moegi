import { HTMLAttributes } from 'preact/compat'
import { MoegiOptions, MoegiOptionsKey, moegiOptions } from '@/services/options'

export type SelectProps = Omit<HTMLAttributes<HTMLSelectElement>, 'name'> & {
  label: string
  name: MoegiOptionsKey
  options: Array<{
    text: string
    value: MoegiOptions[SelectProps["name"]]
  }>
}

export default function Select(props: SelectProps) {
  const { label, name, options } = props

  return (
    <>
      <label class="py-1" for={name}>{ label }:</label>
      <select
        id={name}
        class="bg-gray-50 disabled:bg-gray-100 p-1 b-1 disabled:c-gray"
        {...props}
      >
        { options.map(({ text, value }) => (
          <option
            value={value as string}
            selected={value === moegiOptions.value[name]}
          >
            { text }
          </option>)
        )
      }
      </select>
    </>
  )
}
