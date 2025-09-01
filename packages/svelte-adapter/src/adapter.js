/**
 * Svelte Adapter - Bridges Svelte components with FerroFrame TUI
 */

import { Component, ComponentTree } from '@ferroframe/core';
import { compile } from 'svelte/compiler';
import { writable, readable, derived, get } from 'svelte/store';

/**
 * SvelteComponent adapter for TUI
 */
export class SvelteAdapter extends Component {
  constructor(svelteComponent, props = {}) {
    super(props);
    
    this.svelteComponent = svelteComponent;
    this.instance = null;
    this.fragment = null;
    this.context = new Map();
    this.stores = new Map();
    this.bindings = new Map();
    
    // Create reactive context
    this.createReactiveContext();
  }
  
  /**
   * Create reactive context for Svelte component
   */
  createReactiveContext() {
    // Create props store
    this.propsStore = writable(this.props);
    
    // Create state store
    this.stateStore = writable(this.state);
    
    // Subscribe to changes
    this.propsStore.subscribe((props) => {
      this.props = props;
      this.scheduleUpdate();
    });
    
    this.stateStore.subscribe((state) => {
      this.state = state;
      this.scheduleUpdate();
    });
  }
  
  /**
   * Mount the Svelte component
   */
  mount() {
    super.mount();
    
    // Create component instance
    this.createInstance();
    
    // Initial render
    this.updateFragment();
  }
  
  /**
   * Create Svelte component instance
   */
  createInstance() {
    if (this.instance) {
      return;
    }
    
    // Create TUI target
    const target = {
      appendChild: (child) => {
        this.children.push(child);
      },
      removeChild: (child) => {
        const index = this.children.indexOf(child);
        if (index !== -1) {
          this.children.splice(index, 1);
        }
      },
      insertBefore: (child, before) => {
        const index = this.children.indexOf(before);
        if (index !== -1) {
          this.children.splice(index, 0, child);
        } else {
          this.children.push(child);
        }
      },
    };
    
    // Create component options
    const options = {
      target,
      props: this.props,
      context: this.context,
      $$inline: true,
    };
    
    // Instantiate Svelte component
    this.instance = new this.svelteComponent(options);
    
    // Set up event listeners
    if (this.instance.$on) {
      this.setupEventListeners();
    }
  }
  
  /**
   * Setup event listeners from Svelte component
   */
  setupEventListeners() {
    // Common events
    const events = ['click', 'input', 'change', 'focus', 'blur', 'keydown', 'keyup'];
    
    for (const event of events) {
      this.instance.$on(event, (e) => {
        this.emit(event, e.detail);
      });
    }
  }
  
  /**
   * Update component fragment
   */
  updateFragment() {
    if (!this.instance) {
      return;
    }
    
    // Update props
    if (this.instance.$set) {
      this.instance.$set(this.props);
    }
    
    // Force update
    if (this.instance.$$.update) {
      this.instance.$$.update();
    }
    
    // Get rendered output
    this.fragment = this.extractFragment();
  }
  
  /**
   * Extract rendered fragment from Svelte component
   */
  extractFragment() {
    // This is simplified - real implementation would need to
    // traverse the Svelte component's fragment tree
    return this.children;
  }
  
  /**
   * Render the component
   */
  render() {
    if (!this.instance) {
      return null;
    }
    
    // Convert Svelte output to TUI components
    return this.convertToTUI(this.fragment);
  }
  
  /**
   * Convert Svelte output to TUI components
   */
  convertToTUI(fragment) {
    if (!fragment) {
      return null;
    }
    
    if (Array.isArray(fragment)) {
      return fragment.map(item => this.convertToTUI(item));
    }
    
    // Map Svelte elements to TUI components
    if (typeof fragment === 'object') {
      const { type, props = {}, children = [] } = fragment;
      
      // Map common HTML-like elements to TUI components
      const mapping = {
        'div': 'box',
        'span': 'text',
        'p': 'text',
        'input': 'input',
        'button': 'button',
        'ul': 'list',
        'ol': 'list',
      };
      
      const tuiType = mapping[type] || type;
      
      return {
        type: tuiType,
        ...props,
        children: this.convertToTUI(children),
      };
    }
    
    return fragment;
  }
  
  /**
   * Handle input
   */
  handleInput(key) {
    // Forward to Svelte component if it has input handler
    if (this.instance && this.instance.handleInput) {
      return this.instance.handleInput(key);
    }
    
    return super.handleInput(key);
  }
  
  /**
   * Unmount the component
   */
  unmount() {
    // Destroy Svelte instance
    if (this.instance && this.instance.$destroy) {
      this.instance.$destroy();
    }
    
    this.instance = null;
    this.fragment = null;
    
    super.unmount();
  }
  
  /**
   * Update props
   */
  setProps(props) {
    this.props = { ...this.props, ...props };
    this.propsStore.set(this.props);
  }
  
  /**
   * Get store value
   */
  getStore(name) {
    return this.stores.get(name);
  }
  
  /**
   * Set store value
   */
  setStore(name, store) {
    this.stores.set(name, store);
  }
}

/**
 * Create a Svelte component adapter
 */
export function createSvelteAdapter(svelteComponent) {
  return class extends SvelteAdapter {
    constructor(props) {
      super(svelteComponent, props);
    }
  };
}

/**
 * Compile Svelte component for TUI
 */
export async function compileSvelteComponent(source, options = {}) {
  const defaultOptions = {
    generate: 'dom',
    dev: process.env.NODE_ENV !== 'production',
    css: 'injected',
    hydratable: false,
    ...options,
  };
  
  try {
    const result = compile(source, defaultOptions);
    
    // Transform the compiled output for TUI
    const transformed = transformForTUI(result);
    
    return transformed;
  } catch (error) {
    console.error('Svelte compilation error:', error);
    throw error;
  }
}

/**
 * Transform compiled Svelte output for TUI
 */
function transformForTUI(compiled) {
  const { js, css, warnings } = compiled;
  
  // Log warnings
  if (warnings.length > 0) {
    console.warn('Svelte compilation warnings:', warnings);
  }
  
  // Transform JS code to work with TUI
  let code = js.code;
  
  // Replace DOM operations with TUI operations
  code = code.replace(/document\./g, 'this.target.');
  code = code.replace(/window\./g, 'global.');
  
  // Replace element creation with TUI component creation
  code = code.replace(
    /createElement\(['"](\w+)['"]\)/g,
    (match, tag) => {
      const mapping = {
        'div': 'Box',
        'span': 'Text',
        'p': 'Text',
        'input': 'Input',
        'button': 'Button',
      };
      
      const component = mapping[tag] || 'Box';
      return `this.createTUIComponent('${component}')`;
    }
  );
  
  return {
    code,
    css: css.code,
    map: js.map,
  };
}

/**
 * Mount a Svelte component to TUI
 */
export async function mountSvelteComponent(component, host, props = {}) {
  // Create adapter
  const adapter = new SvelteAdapter(component, props);
  
  // Mount to host
  await host.mount(adapter);
  
  return adapter;
}