/**
 * InputManager - Handles keyboard and mouse input for the TUI
 */

import { EventEmitter } from 'node:events';
import readline from 'node:readline';
import process from 'node:process';

export class InputManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      mouse: false,
      ...config,
    };
    
    this.rl = null;
    this.isActive = false;
    this.keyHandlers = new Map();
  }

  /**
   * Start listening for input
   */
  start() {
    if (this.isActive) {
      return;
    }

    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    // Set raw mode for better key handling
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    // Enable mouse tracking if configured
    if (this.config.mouse) {
      this.enableMouse();
    }

    // Set up key listener
    process.stdin.on('data', this.handleData);

    // Handle readline events
    this.rl.on('line', (input) => {
      this.emit('line', input);
    });

    this.isActive = true;
    this.emit('start');
  }

  /**
   * Stop listening for input
   */
  stop() {
    if (!this.isActive) {
      return;
    }

    // Disable mouse tracking
    if (this.config.mouse) {
      this.disableMouse();
    }

    // Remove data listener
    process.stdin.off('data', this.handleData);

    // Restore terminal mode
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    // Close readline interface
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }

    this.isActive = false;
    this.emit('stop');
  }

  /**
   * Handle raw input data
   */
  handleData = (data) => {
    const key = this.parseKey(data);
    
    if (key) {
      this.emit('keypress', key);
      
      // Check for registered handlers
      const handler = this.keyHandlers.get(this.getKeyString(key));
      if (handler) {
        handler(key);
      }
    }
  };

  /**
   * Parse raw input data into key object
   */
  parseKey(data) {
    const str = data.toString();
    const key = {
      sequence: str,
      name: null,
      ctrl: false,
      meta: false,
      shift: false,
      code: null,
    };

    // Handle special sequences
    if (str === '\x03') {
      // Ctrl+C
      key.name = 'c';
      key.ctrl = true;
    } else if (str === '\x1b') {
      // Escape
      key.name = 'escape';
    } else if (str === '\r' || str === '\n') {
      // Enter
      key.name = 'enter';
    } else if (str === '\t') {
      // Tab
      key.name = 'tab';
    } else if (str === '\x7f' || str === '\x08') {
      // Backspace
      key.name = 'backspace';
    } else if (str === '\x1b[A') {
      // Up arrow
      key.name = 'up';
    } else if (str === '\x1b[B') {
      // Down arrow
      key.name = 'down';
    } else if (str === '\x1b[C') {
      // Right arrow
      key.name = 'right';
    } else if (str === '\x1b[D') {
      // Left arrow
      key.name = 'left';
    } else if (str === '\x1b[H') {
      // Home
      key.name = 'home';
    } else if (str === '\x1b[F') {
      // End
      key.name = 'end';
    } else if (str === '\x1b[5~') {
      // Page Up
      key.name = 'pageup';
    } else if (str === '\x1b[6~') {
      // Page Down
      key.name = 'pagedown';
    } else if (str === '\x1b[3~') {
      // Delete
      key.name = 'delete';
    } else if (str.startsWith('\x1b[') && str.endsWith('~')) {
      // Function keys
      const match = str.match(/\x1b\[(\d+)~/);
      if (match) {
        const code = parseInt(match[1], 10);
        if (code >= 11 && code <= 24) {
          key.name = `f${code - 10}`;
        }
      }
    } else if (str.length === 1) {
      // Regular character
      const code = str.charCodeAt(0);
      
      if (code < 32) {
        // Control character
        key.ctrl = true;
        key.name = String.fromCharCode(code + 64).toLowerCase();
      } else {
        // Normal character
        key.name = str;
        key.shift = str === str.toUpperCase() && str !== str.toLowerCase();
      }
      
      key.code = code;
    } else if (str.startsWith('\x1b')) {
      // Alt/Meta key combination
      key.meta = true;
      const char = str.slice(1);
      if (char.length === 1) {
        key.name = char;
      }
    }

    return key;
  }

  /**
   * Get string representation of key for mapping
   */
  getKeyString(key) {
    let str = '';
    
    if (key.ctrl) str += 'ctrl+';
    if (key.meta) str += 'meta+';
    if (key.shift) str += 'shift+';
    
    str += key.name || key.sequence;
    
    return str;
  }

  /**
   * Register a key handler
   */
  onKey(keyPattern, handler) {
    this.keyHandlers.set(keyPattern, handler);
  }

  /**
   * Remove a key handler
   */
  offKey(keyPattern) {
    this.keyHandlers.delete(keyPattern);
  }

  /**
   * Enable mouse tracking
   */
  enableMouse() {
    // Enable mouse tracking (X10 compatibility mode)
    process.stdout.write('\x1b[?1000h');
    
    // Enable mouse motion tracking
    process.stdout.write('\x1b[?1003h');
    
    // Enable SGR mouse mode (for better coordinates)
    process.stdout.write('\x1b[?1006h');
  }

  /**
   * Disable mouse tracking
   */
  disableMouse() {
    // Disable mouse tracking
    process.stdout.write('\x1b[?1000l');
    
    // Disable mouse motion tracking
    process.stdout.write('\x1b[?1003l');
    
    // Disable SGR mouse mode
    process.stdout.write('\x1b[?1006l');
  }

  /**
   * Parse mouse event from input
   */
  parseMouse(data) {
    const str = data.toString();
    
    // SGR mouse format: \x1b[<button;x;y(M or m)
    const sgrMatch = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
    
    if (sgrMatch) {
      const [, buttonCode, x, y, release] = sgrMatch;
      
      const mouse = {
        x: parseInt(x, 10) - 1,
        y: parseInt(y, 10) - 1,
        button: null,
        action: release === 'm' ? 'release' : 'press',
        shift: false,
        meta: false,
        ctrl: false,
      };
      
      const code = parseInt(buttonCode, 10);
      
      // Parse button
      if ((code & 3) === 0) mouse.button = 'left';
      else if ((code & 3) === 1) mouse.button = 'middle';
      else if ((code & 3) === 2) mouse.button = 'right';
      
      // Parse modifiers
      if (code & 4) mouse.shift = true;
      if (code & 8) mouse.meta = true;
      if (code & 16) mouse.ctrl = true;
      
      // Check for scroll
      if (code & 64) {
        mouse.action = 'scroll';
        mouse.button = (code & 1) ? 'down' : 'up';
      }
      
      return mouse;
    }
    
    return null;
  }

  /**
   * Wait for a single keypress
   */
  async waitForKey() {
    return new Promise((resolve) => {
      const handler = (key) => {
        this.off('keypress', handler);
        resolve(key);
      };
      
      this.once('keypress', handler);
    });
  }

  /**
   * Read a line of input
   */
  async readLine(prompt = '') {
    if (prompt) {
      process.stdout.write(prompt);
    }
    
    return new Promise((resolve) => {
      const handler = (line) => {
        this.off('line', handler);
        resolve(line);
      };
      
      this.once('line', handler);
    });
  }
}