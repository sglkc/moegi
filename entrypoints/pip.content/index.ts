import { defineContentScript } from '#imports'
import { LYRICS_CONTAINER } from '@/utils/constants'
import { WindowDPIP } from './types'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.log('registered picture-in-picture floating lyrics content script')

    const w = window as WindowDPIP

    if (!w.documentPictureInPicture) {
      console.error('Picture in picture not supported!')
      return
    }

    w.documentPictureInPicture.addEventListener('enter', ({ currentTarget: { window } }) => {
      if (!window) return

      console.warn('pip opened')

      // disable premium element
      const style = window.document.createElement('style')
      const css = `
        [style^='--background-image-url'] > div:nth-child(1) {
          display: none!important;
        }
`

      style.innerHTML = css
      window.document.head.append(style)

      // Proxy for messaging, idk why postMessage doesnt work even with same origin
      window.proxy = new Proxy({ message: '' }, {
        get: Reflect.get,
        set(target, prop, newValue: string) {
          if (prop !== 'message') return false

          // TODO: Handle messages here
          target[prop] = newValue
          // @ts-ignore
          window.console.log(newValue)
          return true
        },
      })

      const observer = new MutationObserver((mutations) => {
        if (mutations.length !== 2) return

        const activeLyric = mutations[1].target
        if (!(activeLyric instanceof HTMLElement)) return

        window.proxy!.message = activeLyric.textContent ?? 'No lyrics'
      })

      // Currently only works in /lyrics page
      // TODO: better active handling
      const intervalId = setInterval(() => {
        const container = document.querySelector(LYRICS_CONTAINER)
        if (!container) return
        observer.observe(container, { childList: true, subtree: true, attributeFilter: ['class'] })
        clearInterval(intervalId)
      }, 500)

      // On pip close
      window.addEventListener('pagehide', () => {
        console.warn('pip closed')
      }, { once: true })
    })
  }
})
