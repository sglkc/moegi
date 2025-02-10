import { Signal } from '@preact/signals'
import { ComponentChildren } from 'preact'

interface ContainerProps {
  name: keyof MoegiOptions
  label: string
  children: ComponentChildren
  enabled?: Signal<boolean>
}

/**
 * @todo accordion, toggle visibility
 */
export default function Container({
  name,
  label,
  children,
  enabled,
}: ContainerProps) {
  return (
    <>
      <Checkbox name={name} checked={enabled}>
        <strong>{ label }</strong>
      </Checkbox>
      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        { children }
      </div>
    </>
  )
}
