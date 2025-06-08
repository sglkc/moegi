import { Signal } from '@preact/signals'
import { ChangeEvent, InputHTMLAttributes } from 'preact/compat'
import { useId } from 'preact/hooks'

export interface SliderProps extends InputHTMLAttributes {
  label: string
  signal: Signal<number> | undefined
  prefix?: string
}

export default function Slider({ label, signal, prefix, ...props }: SliderProps) {
  const id = useId()
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    signal && (signal.value = Number(e.currentTarget.value))

  return (
    <label class="grid grid-cols-9 gap-2 items-center" for={id}>
      <span class="col-span-3">{ label }:</span>
      <input
        id={id}
        class={[
          'appearance-none col-span-4 bg-secondary disabled:bg-secondary/50 h-2',
          'rounded b-primary/50 disabled:color-text/50',
          '[&::-webkit-slider-thumb]:(appearance-none w-4 h-4 rounded-full bg-accent)'
        ].join(' ')}
        type="range"
        value={signal?.value}
        onChange={onChange}
        {...props}
      />
      <span class="col-span-2 text-right">
        { signal?.value }{ prefix }
      </span>
    </label>
  )
}
