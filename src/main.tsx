import { render } from 'preact'
import { App } from './app.tsx'
import '@unocss/reset/tailwind-compat.css'
import './index.css'
import 'virtual:uno.css'

render(<App />, document.getElementById('app')!)
