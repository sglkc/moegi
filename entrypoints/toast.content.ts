import Toastify, { Options } from 'toastify-js'
import 'toastify-js/src/toastify.css'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    const options: Options = {
      duration: 3000,
      position: 'center',
      stopOnFocus: false,
      style: {
        background: '#e6efcd',
        color: '#1d230b'
      },
    }

    // TODO: handle -1 duration?
    onMessage('sendToast', ({ data }) => {
      Toastify({ ...options, text: data }).showToast()
    })

    console.log('registered toast content script')
  },
})
