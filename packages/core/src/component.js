/**
 * Component System - Base component class and mounting utilities
 */

import { EventEmitter } from 'node:events';
import { LayoutNode, Layout } from './layout.js';

/**
 * Base Component class
 */
export class Component extends EventEmitter {
  constructor(props = {}) {
    super();
    
    this.props = props;
    this.state = {};
    this.children = [];
    this.parent = null;
    this.mounted = false;
    this.dirty = false;
    
    // Bind methods
    this.setState = this.setState.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
  }
  
  /**
   * Set component state and trigger re-render
   */
  setState(updates) {
    const prevState = { ...this.state };
    
    if (typeof updates === 'function') {
      this.state = { ...this.state, ...updates(this.state) };
    } else {
      this.state = { ...this.state, ...updates };
    }
    
    this.dirty = true;
    this.emit('stateChange', this.state, prevState);
    
    // Schedule re-render
    if (this.mounted) {
      this.scheduleUpdate();
    }
  }
  
  /**
   * Force component update
   */
  forceUpdate() {
    this.dirty = true;
    if (this.mounted) {
      this.scheduleUpdate();
    }
  }
  
  /**
   * Schedule an update
   */
  scheduleUpdate() {
    // Use next tick to batch updates
    process.nextTick(() => {
      if (this.dirty && this.mounted) {
        this.update();
        this.dirty = false;
      }
    });
  }
  
  /**
   * Update component
   */
  update() {
    this.emit('beforeUpdate');
    
    // Re-render component
    const rendered = this.render();
    this.emit('update', rendered);
    
    this.emit('afterUpdate');
  }
  
  /**
   * Mount component
   */
  mount() {
    if (this.mounted) {
      return;
    }
    
    this.emit('beforeMount');
    
    this.mounted = true;
    
    // Initial render
    const rendered = this.render();
    
    // Mount children
    if (this.children) {
      for (const child of this.children) {
        if (child && typeof child.mount === 'function') {
          child.mount();
        }
      }
    }
    
    this.emit('mount', rendered);
    this.emit('afterMount');
  }
  
  /**
   * Unmount component
   */
  unmount() {
    if (!this.mounted) {
      return;
    }
    
    this.emit('beforeUnmount');
    
    // Unmount children
    if (this.children) {
      for (const child of this.children) {
        if (child && typeof child.unmount === 'function') {
          child.unmount();
        }
      }
    }
    
    this.mounted = false;
    
    this.emit('unmount');
    this.emit('afterUnmount');
  }
  
  /**
   * Render component (to be overridden)
   */
  render() {
    return null;
  }
  
  /**
   * Handle input (to be overridden)
   */
  handleInput(key) {
    // Pass to focused child or handle
    for (const child of this.children) {
      if (child && child.focused && typeof child.handleInput === 'function') {
        child.handleInput(key);
        return true;
      }
    }
    
    return false;
  }
}

/**
 * Create a functional component wrapper
 */
export function createComponent(renderFn, options = {}) {
  return class FunctionalComponent extends Component {
    constructor(props) {
      super(props);
      
      // Initialize state from options
      if (options.initialState) {
        this.state = { ...options.initialState };
      }
      
      // Bind lifecycle methods if provided
      if (options.onMount) {
        this.on('afterMount', options.onMount.bind(this));
      }
      if (options.onUnmount) {
        this.on('beforeUnmount', options.onUnmount.bind(this));
      }
      if (options.onUpdate) {
        this.on('afterUpdate', options.onUpdate.bind(this));
      }
    }
    
    render() {
      return renderFn.call(this, this.props, this.state, this.setState);
    }
    
    handleInput(key) {
      if (options.onInput) {
        return options.onInput.call(this, key, this.props, this.state);
      }
      return super.handleInput(key);
    }
  };
}

/**
 * Component tree builder
 */
export class ComponentTree {
  constructor(root) {
    this.root = root;
    this.components = new Map();
    this.focusedComponent = null;
    this.layout = new Layout();
  }
  
  /**
   * Build component tree from definition
   */
  build(definition) {
    if (!definition) {
      return null;
    }
    
    // Handle different component types
    if (typeof definition === 'function') {
      // Component constructor
      const instance = new definition();
      this.registerComponent(instance);
      return instance;
    } else if (definition instanceof Component) {
      // Component instance
      this.registerComponent(definition);
      return definition;
    } else if (typeof definition === 'object') {
      // Plain object component definition
      return this.buildFromObject(definition);
    }
    
    return null;
  }
  
  /**
   * Build component from object definition
   */
  buildFromObject(definition) {
    const { type, props = {}, children = [], ...rest } = definition;
    
    // Create wrapper component
    const component = new Component({ ...props, ...rest });
    
    // Override render to return the definition
    component.render = function() {
      return {
        type,
        ...this.props,
        children: this.children.map(child => 
          child && typeof child.render === 'function' ? child.render() : child
        ),
      };
    };
    
    // Build children
    if (children) {
      const childArray = Array.isArray(children) ? children : [children];
      component.children = childArray.map(child => this.build(child)).filter(Boolean);
      
      // Set parent references
      for (const child of component.children) {
        if (child instanceof Component) {
          child.parent = component;
        }
      }
    }
    
    this.registerComponent(component);
    return component;
  }
  
  /**
   * Register a component
   */
  registerComponent(component) {
    const id = this.generateId();
    this.components.set(id, component);
    component._treeId = id;
  }
  
  /**
   * Generate unique component ID
   */
  generateId() {
    return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Mount the component tree
   */
  mount() {
    if (this.root) {
      this.root.mount();
    }
  }
  
  /**
   * Unmount the component tree
   */
  unmount() {
    if (this.root) {
      this.root.unmount();
    }
  }
  
  /**
   * Update layout for the tree
   */
  updateLayout(width, height) {
    if (!this.root) {
      return null;
    }
    
    // Convert component tree to layout tree
    const layoutRoot = this.createLayoutTree(this.root);
    
    // Calculate layout
    this.layout.calculate(layoutRoot, width, height);
    
    return layoutRoot;
  }
  
  /**
   * Create layout tree from component tree
   */
  createLayoutTree(component) {
    if (!component) {
      return null;
    }
    
    const rendered = component.render();
    if (!rendered) {
      return null;
    }
    
    // Create layout node
    const node = new LayoutNode(rendered.style || {});
    
    // Handle children
    if (rendered.children) {
      const children = Array.isArray(rendered.children) 
        ? rendered.children 
        : [rendered.children];
      
      for (const child of children) {
        if (child) {
          if (child instanceof Component) {
            const childNode = this.createLayoutTree(child);
            if (childNode) {
              node.appendChild(childNode);
            }
          } else if (typeof child === 'object') {
            // Plain object with style
            const childNode = new LayoutNode(child.style || {});
            node.appendChild(childNode);
          }
        }
      }
    }
    
    return node;
  }
  
  /**
   * Handle input for the tree
   */
  handleInput(key) {
    // Try focused component first
    if (this.focusedComponent && this.focusedComponent.handleInput) {
      if (this.focusedComponent.handleInput(key)) {
        return true;
      }
    }
    
    // Try root component
    if (this.root && this.root.handleInput) {
      return this.root.handleInput(key);
    }
    
    return false;
  }
  
  /**
   * Set focused component
   */
  setFocus(component) {
    if (this.focusedComponent && this.focusedComponent !== component) {
      this.focusedComponent.focused = false;
      if (this.focusedComponent.handleBlur) {
        this.focusedComponent.handleBlur();
      }
    }
    
    this.focusedComponent = component;
    
    if (component) {
      component.focused = true;
      if (component.handleFocus) {
        component.handleFocus();
      }
    }
  }
}

/**
 * Create a component from a render function
 */
export function h(type, props = {}, ...children) {
  // Flatten children
  const flatChildren = children.flat(Infinity).filter(child => 
    child !== null && child !== undefined && child !== false
  );
  
  return {
    type,
    props,
    children: flatChildren,
  };
}