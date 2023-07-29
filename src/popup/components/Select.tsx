import { options as optionss, OptionsKey, Options } from '@/popup/handler'

export type SelectProps = {
  label: string
  name: OptionsKey
  options: Array<{
    text: string
    value: Options[SelectProps["name"]]
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
        defaultValue={optionss.value[name] as string}
      >
        { options.map(({ text, value }) => (
          <option value={value as string}>{ text }</option>)
        )
      }
      </select>
    </>
  )
}
