import { PropsWithChildren, useRef } from 'preact/compat'

interface AccordionProps extends PropsWithChildren {
  title: string
}

// https://css-tricks.com/how-to-animate-the-details-element/
export default function Accordion({ children, title }: AccordionProps) {
  const status = useRef<'closed' | 'opened' | 'closing' | 'opening'>('closed')
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation>(null)
  const defaultOpen = Boolean(localStorage.getItem(`accordion-${title}`))

  const callAnimation = (opening: boolean) => {
    window.requestAnimationFrame(() => {
      if (!details.current || !summary.current || !content.current) return

      const startHeight = `${details.current.offsetHeight}px`
      let endHeight = `${summary.current.offsetHeight}px`

      if (status.current === 'opening') {
        endHeight = `${summary.current.offsetHeight + content.current.offsetHeight}px`
      }

      if (animation.current) {
        animation.current.cancel()
      }

      animation.current = details.current.animate(
        { height: [ startHeight, endHeight ] },
        { duration: 250, easing: 'ease-out' }
      )

      animation.current.onfinish = () => onAnimationFinish(opening)
      animation.current.oncancel = () => status.current = opening ? 'closed' : 'opened'
      localStorage.setItem(`accordion-${title}`, opening ? '1' : '')
    })
  }

  const onClick = (e: MouseEvent) => {
    if (!details.current || !summary.current || !content.current) return

    let opening: boolean

    e.preventDefault()
    details.current.style.overflow = 'hidden'

    if (status.current === 'closing' || !details.current.open) {
      details.current.style.height = `${details.current.offsetHeight}px`
      details.current.open = true
      status.current = 'opening'
      opening = true
      callAnimation(opening)
    } else if (status.current === 'opening' || details.current.open) {
      status.current = 'closing'
      opening = false
      callAnimation(opening)
    }
  }

  const onAnimationFinish = (open: boolean) => {
    if (!details.current) return

    details.current.open = open
    animation.current = null
    status.current = open ? 'opened' : 'closed'
    details.current.style.height = details.current.style.overflow = ''
  }

  return (
    <details ref={details} open={defaultOpen}>
      <summary
        ref={summary}
        class="font-bold cursor-pointer"
        onClick={onClick}
      >
        { title }
      </summary>
      <div ref={content} class="pt-2 grid gap-4">
        { children }
      </div>
    </details>
  )
}
