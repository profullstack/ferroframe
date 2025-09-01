/**
 * FerroHost - Core host for managing TUI lifecycle
 * Handles terminal initialization, component mounting, and rendering
 */

import { EventEmitter } from 'node:events';
import process from 'node:process';
import { Renderer } from './renderer.js';
import { InputManager } from './input.js';

export class FerroHost extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      fullscreen: false,
      mouse: false,
      title: 'FerroFrame App',
      ...config,
    };
    
    this.isRunning = false;
    this.componentTree = null;
    this.renderer = null;
    this.inputManager = null;
    this.renderTimer = null;
    this.isDirty = false;
  }

  /**
   * Mount a component as the root of the application
   */
  async mount(component, props = {}) {
    if (this.componentTree) {
      throw new Error('Component already mounted. Call unmount() first.');
    }

    // Initialize the component
    this.componentTree = this.createComponentInstance(component, props);
    
    // Start the host if not running
    if (!this.isRunning) {
      await this.start();
    }
    
    // Initial render
    this.scheduleRender();
    
    this.emit('mount', this.componentTree);
  }

  /**
   * Unmount the current component tree
   */
  async unmount() {
    if (!this.componentTree) {
      return;
    }

    // Call cleanup on component if it exists
    if (this.componentTree.cleanup) {
      await this.componentTree.cleanup();
    }
    
    this.componentTree = null;
    this.emit('unmount');
  }

  /**
   * Start the host and initialize terminal
   */
  async start() {
    if (this.isRunning) {
      return;
    }

    // Initialize renderer
    this.renderer = new Renderer({
      fullscreen: this.config.fullscreen,
    });
    await this.renderer.initialize();
    
    // Initialize input manager
    this.inputManager = new InputManager({
      mouse: this.config.mouse,
    });
    
    // Set up input event forwarding
    this.inputManager.on('keypress', (key) => {
      this.handleInput(key);
    });
    
    // Start input handling
    this.inputManager.start();
    
    // Set terminal title if provided
    if (this.config.title) {
      process.stdout.write(`\x1b]0;${this.config.title}\x07`);
    }
    
    this.isRunning = true;
    this.emit('start');
  }

  /**
   * Stop the host and cleanup
   */
  async cleanup() {
    if (!this.isRunning) {
      return;
    }

    // Clear any pending renders
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
      this.renderTimer = null;
    }
    
    // Unmount component
    await this.unmount();
    
    // Stop input handling
    if (this.inputManager) {
      this.inputManager.stop();
      this.inputManager = null;
    }
    
    // Cleanup renderer
    if (this.renderer) {
      await this.renderer.cleanup();
      this.renderer = null;
    }
    
    this.isRunning = false;
    this.emit('cleanup');
  }

  /**
   * Create a component instance from a component definition
   */
  createComponentInstance(component, props = {}) {
    // Handle different component formats
    if (typeof component === 'function') {
      // Functional component
      return {
        name: component.name || 'Component',
        render: () => component(props),
        props,
      };
    } else if (typeof component === 'object') {
      // Object-based component
      return {
        ...component,
        props,
      };
    } else {
      throw new Error('Invalid component type');
    }
  }

  /**
   * Handle input events
   */
  handleInput(key) {
    // Exit on Ctrl+C or Escape
    if (key.ctrl && key.name === 'c') {
      this.cleanup();
      process.exit(0);
    }
    
    // Forward to component tree if it handles input
    if (this.componentTree?.handleInput) {
      this.componentTree.handleInput(key);
      this.scheduleRender();
    }
    
    this.emit('input', key);
  }

  /**
   * Schedule a render on the next tick
   */
  scheduleRender() {
    if (this.isDirty || !this.isRunning) {
      return;
    }
    
    this.isDirty = true;
    
    // Use setImmediate for next tick rendering
    this.renderTimer = setImmediate(() => {
      this.render();
      this.isDirty = false;
      this.renderTimer = null;
    });
  }

  /**
   * Render the component tree
   */
  render() {
    if (!this.componentTree || !this.renderer) {
      return;
    }

    try {
      // Get rendered output from component
      const output = this.componentTree.render
        ? this.componentTree.render()
        : '';
      
      // Send to renderer
      this.renderer.render(output);
      
      this.emit('render', output);
    } catch (error) {
      // Handle render errors gracefully
      this.emit('error', error);
      
      // Show error in terminal if in development
      if (process.env.NODE_ENV !== 'production') {
        this.renderer?.render(`Error: ${error.message}`);
      }
    }
  }

  /**
   * Trigger an update and re-render
   */
  async update() {
    this.scheduleRender();
    this.emit('update');
  }

  /**
   * Get event listeners for a specific event
   */
  listeners(eventName) {
    return this.rawListeners(eventName);
  }

  /**
   * Remove an event listener
   */
  off(eventName, handler) {
    this.removeListener(eventName, handler);
  }
}