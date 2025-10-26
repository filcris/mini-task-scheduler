import '@testing-library/jest-dom';

// Mock simples para window.matchMedia (alguns componentes usam)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},       // deprecated
    removeListener: () => {},    // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});