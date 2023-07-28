const script = document.createElement('script');

script.src = 'lib/uno.global.js';
script.defer = true;

window.__unocss = {
  shortcuts: {
    'checkbox-label': 'my-1 flex justify-center gap-1 text-center cursor-pointer',
    'input': 'bg-gray-50 disabled:bg-gray-300 p-1 b-1',
  },
};

document.head.appendChild(script);
