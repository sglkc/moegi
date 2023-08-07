import { render } from 'preact'
import Popup from './popup'
import '@fontsource/quicksand/latin-500.css'
import '@fontsource/quicksand/latin-700.css'
import '@fontsource/rocknroll-one/japanese.css'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

render(<Popup />, document.getElementById('app')!)
