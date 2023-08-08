import { HTMLAttributes } from 'preact/compat'
import { MoegiOptionsKey, moegiOptions } from '@/services/options'

export type RangeProps = Omit<HTMLAttributes<HTMLInputElement>, 'name'> & {
  name: MoegiOptionsKey
  prefix?: string
}

export default function Range(props: RangeProps) {
  const { name, label, prefix } = props
  const input = `
appearance-none col-span-4 bg-secondary disabled:bg-secondary/50 h-2 rounded b-primary/50 disabled:color-text/50
`

  const sliderThumb = `
[&::-webkit-slider-thumb]:(appearance-none w-4 h-4 rounded-full bg-accent)
`

  const classes = input.trim() + ' ' + sliderThumb.trim()

  return (
    <label class="py-1 grid grid-cols-9 gap-2 items-center" for={name}>
      <span class="col-span-3">{ label }:</span>
      <input
        id={name}
        class={classes}
        type="range"
        value={moegiOptions.value[name] as string}
        {...props}
      />
      <span class="col-span-2 text-right">
        { moegiOptions.value[name] } { prefix }
      </span>
    </label>
  )
}
