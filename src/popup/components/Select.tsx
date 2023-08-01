import { MoegiOptions, MoegiOptionsKey, moegiOptions } from '@/services/options'

export type SelectProps = {
  label: string
  name: MoegiOptionsKey
  options: Array<{
    text: string
    value: MoegiOptions[SelectProps["name"]]
  }>
}

export default function Select({ label, name, options }: SelectProps) {
  return (
    <>
      <label class="py-1 text-right" for={name}>{ label }:</label>
      <select
        id={name}
        class="bg-gray-50 disabled:bg-gray-200 p-1 b-1"
        name={name}
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
