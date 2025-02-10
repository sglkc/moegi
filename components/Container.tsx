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
    <>
      <Checkbox checked={enabled}>
        <strong>{ label }</strong>
      </Checkbox>
      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        { children }
      </div>
    </>
  )
}
