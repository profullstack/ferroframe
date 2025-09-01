/**
 * FerroFrame Svelte Adapter - Main exports
 */

export {
  SvelteAdapter,
  createSvelteAdapter,
  compileSvelteComponent,
  mountSvelteComponent,
} from './adapter.js';

export {
  tuiWritable,
  tuiReadable,
  tuiDerived,
  terminalSize,
  focusStore,
  themeStore,
  inputMode,
  appState,
  createFormStore,
  createListStore,
  writable,
  readable,
  derived,
  get,
} from './stores.js';

// Re-export core components for convenience
export * from '@ferroframe/components';