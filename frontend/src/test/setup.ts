import '@testing-library/jest-dom'

// polyfill matchMedia para jsdom
if (!window.matchMedia) {
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},       // deprecated
    removeListener: () => {},    // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}



