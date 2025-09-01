/**
 * FerroFrame Core - Main exports
 */

export { FerroHost } from './host.js';
export { Renderer } from './renderer.js';
export { InputManager } from './input.js';
export { Layout, LayoutNode, createLayoutTree } from './layout.js';
export { Component, ComponentTree, createComponent, h } from './component.js';

// Export utilities
export * as ansi from './utils/ansi.js';

// Version
export const version = '0.1.0';