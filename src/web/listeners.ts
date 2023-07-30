// Replace window.history state functions with a proxy that will send an event
// for every time state has changed
const events = ['changestate', 'popstate'] as const;
const methods = ['pushState', 'replaceState'] as const;

methods.forEach((method) => {
  window.history[method] = new Proxy(window.history[method], {
    apply(target, thisArg, detail: [data: any, _: string, url?: string | URL]) {
      window.dispatchEvent(new CustomEvent('changestate', { detail }));
      return target.apply(thisArg, detail);
    }
  }
  );
});

// Listen for history changes and check if user is in lyrics page
events.forEach((event) => window.addEventListener(event, console.log))
