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
        class="appearance-none bg-secondary disabled:bg-secondary/50 p-1 px-2 b-1 rounded b-primary/50 disabled:color-text/50"
        type="text"
        value={moegiOptions.value[name] as string}
        {...props}
      />
    </>
  )
}
