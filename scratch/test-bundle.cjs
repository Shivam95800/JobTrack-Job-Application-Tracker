const fs = require('fs');
const vm = require('vm');
const path = require('path');

const file = fs.readdirSync('dist/assets').find((f) => f.endsWith('.js'));
const code = fs.readFileSync(path.join('dist/assets', file), 'utf8');

const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

const documentMock = {
  documentElement: {
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
  },
  getElementById: () => ({
    nodeType: 1,
    appendChild: () => {},
    tagName: 'DIV',
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({
    appendChild: () => {},
    setAttribute: () => {},
    style: {},
  }),
  head: {
    appendChild: () => {},
  },
  body: {
    appendChild: () => {},
  },
};

const windowMock = {
  document: documentMock,
  localStorage: localStorageMock,
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  location: { href: 'http://localhost/', pathname: '/', search: '', hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  history: { pushState: () => {}, replaceState: () => {} },
  navigator: { userAgent: 'node' },
};

  class MutationObserver { observe() {} disconnect() {} }
  class ResizeObserver { observe() {} disconnect() {} }
  windowMock.MutationObserver = MutationObserver;
  windowMock.ResizeObserver = ResizeObserver;

  const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  MutationObserver,
  ResizeObserver,
  URL,
  Blob,
  localStorage: localStorageMock,
  navigator: windowMock.navigator,
  location: windowMock.location,
  history: windowMock.history,
  matchMedia: windowMock.matchMedia,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  // module / import meta stubs if needed
});

try {
  // Replace import.meta with dummy object for node vm
  const cleanCode = code.replace(/import\.meta/g, '({})');
  vm.runInContext(cleanCode, context);
  console.log('Bundle executed successfully in VM without error!');
} catch (err) {
  console.error('CAUGHT ERROR IN BUNDLE:');
  console.error(err);
}
