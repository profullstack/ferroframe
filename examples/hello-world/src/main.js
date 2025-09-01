/**
 * FerroFrame Hello World Example
 * Demonstrates basic TUI rendering with the framework
 */

import { FerroHost, ansi } from '@ferroframe/core';

// Create a simple component
const HelloWorldComponent = {
  name: 'HelloWorld',
  state: {
    counter: 0,
    message: 'Welcome to FerroFrame!',
  },
  
  render() {
    const { counter, message } = this.state;
    
    // Build the UI using ANSI utilities
    const lines = [];
    
    // Title with styling
    lines.push(ansi.applyStyle('╭─────────────────────────────────╮', ansi.style.cyan));
    lines.push(ansi.applyStyle('│  FerroFrame TUI Framework  🦀   │', ansi.style.cyan, ansi.style.bold));
    lines.push(ansi.applyStyle('╰─────────────────────────────────╯', ansi.style.cyan));
    lines.push('');
    
    // Message
    lines.push(ansi.applyStyle(message, ansi.style.green));
    lines.push('');
    
    // Counter
    lines.push(`Counter: ${ansi.applyStyle(counter.toString(), ansi.style.yellow, ansi.style.bold)}`);
    lines.push('');
    
    // Instructions
    lines.push(ansi.applyStyle('Instructions:', ansi.style.dim));
    lines.push('  ↑/↓ - Increment/Decrement counter');
    lines.push('  r   - Reset counter');
    lines.push('  q   - Quit application');
    lines.push('');
    
    // Progress bar
    const progress = Math.abs(counter % 21);
    lines.push('Progress: [' + ansi.progressBar(progress, 20, 20) + ']');
    
    return lines.join('\n');
  },
  
  handleInput(key) {
    if (key.name === 'up') {
      this.state.counter++;
      this.state.message = 'Counter incremented!';
    } else if (key.name === 'down') {
      this.state.counter--;
      this.state.message = 'Counter decremented!';
    } else if (key.name === 'r') {
      this.state.counter = 0;
      this.state.message = 'Counter reset!';
    } else if (key.name === 'q') {
      process.exit(0);
    }
  },
};

// Main application
async function main() {
  console.log('Starting FerroFrame Hello World...\n');
  
  // Create host instance
  const host = new FerroHost({
    fullscreen: false,
    title: 'FerroFrame Hello World',
  });
  
  try {
    // Mount the component
    await host.mount(HelloWorldComponent);
    
    // Set up update loop for animation
    setInterval(() => {
      host.update();
    }, 100);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await host.cleanup();
      console.log('\nGoodbye! 👋');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error:', error);
    await host.cleanup();
    process.exit(1);
  }
}

// Run the application
main().catch(console.error);