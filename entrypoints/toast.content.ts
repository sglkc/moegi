import { defineContentScript } from '#imports'
import Toastify from 'toastify-js'
import StartToastifyInstance from 'toastify-js'
import { Background, Content, ToastMessage } from '@/utils/messaging'
import 'toastify-js/src/toastify.css'

const toasts = new Map<number, ReturnType<typeof StartToastifyInstance>>()

function createToast({ text, duration }: ToastMessage): number {
  const id = Math.round(Math.random() * 999_999)
  const toast = Toastify({
    text,
    duration,
    position: 'center',
    stopOnFocus: false,
    style: {
      background: '#e6efcd',
      color: '#1d230b'
    },
  })

  toasts.set(id, toast)
  toast.showToast()

  if (duration && duration > 0) {
    setTimeout(() => toasts.has(id) && toasts.delete(id), duration)
  }

  return id
}

function destroyToast(id: number): boolean {
  if (!toasts.has(id)) return false

  toasts.get(id)?.hideToast()
  toasts.delete(id)

  return true
}

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    [Content, Background].forEach((messenger) => {
      messenger.onMessage('createToast', ({ data }) => createToast(data))
      messenger.onMessage('destroyToast', ({ data }) => destroyToast(data))
    })

    console.log('registered toast content script')
  },
})
