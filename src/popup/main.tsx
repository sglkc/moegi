import { render } from 'preact'
import Popup from './popup'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

render(<Popup />, document.getElementById('app')!)
