import Toastify from 'toastify-js';
import toastifyCss from 'toastify-js/src/toastify.css?inline';

const styleElement = document.createElement('style');
styleElement.innerHTML = toastifyCss;
document.head.append(styleElement);

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
