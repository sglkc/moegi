import { DeepSignal } from 'deepsignal'
import { ComponentChildren } from 'preact'

interface ContainerProps {
  label: string
  children: ComponentChildren
  signal: DeepSignal<MoegiOptions[keyof MoegiOptions]>
}

/**
 * @todo better accordion, toggle visibility
 */
export default function Container({
  label,
  children,
  signal,
}: ContainerProps) {
  return (
    <div>
      <Checkbox signal={signal.$enabled}>
        <strong>{ label }</strong>
      </Checkbox>
      <div
        class={[
          'grid gap-4 overflow-y-hidden transition-transform transform-origin-top',
          signal.enabled ? 'scale-y-full' : 'h-0 scale-y-0'
        ].join(' ')}
      >
        <hr class="b-0 col-span-full" />
        { children }
      </div>
    </div>
  )
}
