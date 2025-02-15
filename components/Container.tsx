import { Signal } from '@preact/signals'
import { ComponentChildren } from 'preact'

interface ContainerProps {
  label: string
  children: ComponentChildren
  enabled?: Signal<boolean>
}

/**
 * @todo accordion, toggle visibility
 */
export default function Container({
  label,
  children,
  enabled,
}: ContainerProps) {
  return (
    <div class="grid gap-4">
      <div>
        <Checkbox checked={enabled}>
          <strong>{ label }</strong>
        </Checkbox>
      </div>
      <div class="grid gap-4">
        { children }
      </div>
    </div>
  )
}
