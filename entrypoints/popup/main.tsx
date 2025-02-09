import { render } from 'preact';
import Popup from './Popup.tsx';
import '@unocss/reset/tailwind-compat.css';
import 'virtual:uno.css';

render(<Popup />, document.getElementById('root')!);
