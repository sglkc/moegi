import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const createToast = (text: string, duration: number = 3000) => Toastify({
  duration,
  position: 'center',
  stopOnFocus: false,
  style: {
    background: '#e6efcd',
    color: '#1d230b'
  },
  text
});

export default createToast;
