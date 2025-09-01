/**
 * Renderer - Handles terminal rendering and ANSI escape sequences
 * Manages screen buffer and efficient updates
 */

import process from 'node:process';
import { clearScreen, moveCursor, hideCursor, showCursor } from './utils/ansi.js';

export class Renderer {
  constructor(config = {}) {
    this.config = {
      fullscreen: false,
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24,
      ...config,
    };
    
    this.buffer = [];
    this.previousBuffer = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the renderer and prepare terminal
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // Save current terminal state
    this.saveTerminalState();
    
    // Clear screen if fullscreen mode
    if (this.config.fullscreen) {
      process.stdout.write(clearScreen());
      process.stdout.write(moveCursor(0, 0));
    }
    
    // Hide cursor for cleaner rendering
    process.stdout.write(hideCursor());
    
    // Set up terminal resize handler
    this.handleResize = () => {
      this.config.width = process.stdout.columns || 80;
      this.config.height = process.stdout.rows || 24;
      this.clear();
    };
    
    process.stdout.on('resize', this.handleResize);
    
    this.isInitialized = true;
  }

  /**
   * Clean up and restore terminal state
   */
  async cleanup() {
    if (!this.isInitialized) {
      return;
    }

    // Remove resize handler
    if (this.handleResize) {
      process.stdout.off('resize', this.handleResize);
    }
    
    // Restore terminal state
    this.restoreTerminalState();
    
    // Show cursor again
    process.stdout.write(showCursor());
    
    // Clear screen if we were in fullscreen
    if (this.config.fullscreen) {
      process.stdout.write(clearScreen());
      process.stdout.write(moveCursor(0, 0));
    }
    
    this.isInitialized = false;
  }

  /**
   * Save terminal state for later restoration
   */
  saveTerminalState() {
    // Save cursor position
    process.stdout.write('\x1b7');
  }

  /**
   * Restore saved terminal state
   */
  restoreTerminalState() {
    // Restore cursor position
    process.stdout.write('\x1b8');
  }

  /**
   * Render content to the terminal
   */
  render(content) {
    if (!this.isInitialized) {
      return;
    }

    // Convert content to string if needed
    const output = typeof content === 'string' 
      ? content 
      : this.renderComponent(content);
    
    // Split into lines
    const lines = output.split('\n');
    
    // Update buffer
    this.buffer = lines;
    
    // Perform differential rendering
    this.performRender();
  }

  /**
   * Render a component tree to string
   */
  renderComponent(component) {
    if (!component) {
      return '';
    }

    // Handle different component types
    if (typeof component === 'string') {
      return component;
    }
    
    if (Array.isArray(component)) {
      return component.map((c) => this.renderComponent(c)).join('');
    }
    
    if (component.type === 'text') {
      return component.content || '';
    }
    
    if (component.type === 'box') {
      return this.renderBox(component);
    }
    
    // Default: try to render children
    if (component.children) {
      return this.renderComponent(component.children);
    }
    
    return '';
  }

  /**
   * Render a box component
   */
  renderBox(box) {
    const { width = 10, height = 3, border = false, children } = box;
    const content = this.renderComponent(children);
    
    if (!border) {
      return content;
    }
    
    // Simple box drawing
    const lines = [];
    const contentLines = content.split('\n');
    
    // Top border
    lines.push('┌' + '─'.repeat(width - 2) + '┐');
    
    // Content with side borders
    for (let i = 0; i < height - 2; i++) {
      const line = contentLines[i] || '';
      const paddedLine = line.padEnd(width - 2, ' ').slice(0, width - 2);
      lines.push('│' + paddedLine + '│');
    }
    
    // Bottom border
    lines.push('└' + '─'.repeat(width - 2) + '┘');
    
    return lines.join('\n');
  }

  /**
   * Perform the actual rendering to terminal
   */
  performRender() {
    // Move cursor to top-left if fullscreen
    if (this.config.fullscreen) {
      process.stdout.write(moveCursor(0, 0));
    }
    
    // Render each line
    const maxLines = Math.min(this.buffer.length, this.config.height);
    
    for (let i = 0; i < maxLines; i++) {
      const line = this.buffer[i] || '';
      const previousLine = this.previousBuffer[i];
      
      // Only update changed lines for efficiency
      if (line !== previousLine) {
        if (this.config.fullscreen) {
          process.stdout.write(moveCursor(0, i));
        }
        
        // Clear line and write new content
        process.stdout.write('\x1b[2K'); // Clear entire line
        process.stdout.write(line.slice(0, this.config.width));
        
        if (!this.config.fullscreen || i < maxLines - 1) {
          process.stdout.write('\n');
        }
      }
    }
    
    // Clear any remaining lines from previous render
    if (this.previousBuffer.length > this.buffer.length) {
      for (let i = this.buffer.length; i < this.previousBuffer.length; i++) {
        if (this.config.fullscreen) {
          process.stdout.write(moveCursor(0, i));
        }
        process.stdout.write('\x1b[2K'); // Clear entire line
      }
    }
    
    // Update previous buffer
    this.previousBuffer = [...this.buffer];
  }

  /**
   * Clear the screen
   */
  clear() {
    if (!this.isInitialized) {
      return;
    }

    process.stdout.write(clearScreen());
    this.buffer = [];
    this.previousBuffer = [];
  }

  /**
   * Write raw output to terminal
   */
  writeRaw(text) {
    process.stdout.write(text);
  }
}