import { HTMLAttributes } from 'preact/compat'
import { MoegiOptionsKey, moegiOptions } from '@/services/options'

export type InputProps = Omit<HTMLAttributes<HTMLInputElement>, 'name'> & {
  name: MoegiOptionsKey
}

export default function Input(props: InputProps) {
  const { name, label } = props;

  return (
    <>
      <label class="py-1 text-center" for={name}>{ label }:</label>
      <input
        id={name}
        class="bg-gray-50 disabled:bg-gray-200 p-1 b-1 px-2"
        type="text"
        defaultValue={moegiOptions.value[name] as string}
        {...props}
      />
    </>
  )
}
