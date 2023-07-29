// Modification to window.history will send custom events to window
const generateProxyOptions: any = (name: string) => ({
  apply(
    target: Function & History,
    thisArg: ThisParameterType<History>,
    argArray: string[]
  ) {
    window.dispatchEvent(new CustomEvent(name, { detail: argArray }));

    return target.apply(thisArg, argArray);
  }
});

const events = ['pushstate', 'replacestate', 'popstate'] as const;
const methods = ['pushState', 'replaceState'] as const;

methods.forEach((method, i) => {
  window.history[method] = new Proxy(
    window.history[method],
    generateProxyOptions(events[i])
  );
});

// Listen for history changes and check if user is in lyrics page
events.forEach((event) => window.addEventListener(event, console.log));
