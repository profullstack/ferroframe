#!/usr/bin/env node

/**
 * Watch script for FerroFrame development
 * Monitors file changes and runs tests automatically
 */

import { watch } from 'fs';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  FerroFrame File Watcher                     ║
╚══════════════════════════════════════════════════════════════╝

Watching for changes in:
  • packages/core/src
  • packages/components/src
  • packages/svelte-adapter/src

Press Ctrl+C to stop watching.
`);

// Paths to watch
const watchPaths = [
  resolve(rootDir, 'packages/core/src'),
  resolve(rootDir, 'packages/core/tests'),
  resolve(rootDir, 'packages/components/src'),
  resolve(rootDir, 'packages/components/tests'),
  resolve(rootDir, 'packages/svelte-adapter/src'),
  resolve(rootDir, 'packages/svelte-adapter/tests')
];

// Debounce function to avoid multiple triggers
let timeout;
const debounce = (func, wait) => {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Run tests
const runTests = debounce(() => {
  console.log('\n🧪 Running tests...\n');
  
  const child = spawn('pnpm', ['test'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!\n');
    } else {
      console.log('\n❌ Some tests failed.\n');
    }
    console.log('👀 Watching for changes...\n');
  });
}, 500);

// Set up watchers
watchPaths.forEach(path => {
  try {
    watch(path, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.js') || filename.endsWith('.test.js'))) {
        console.log(`📝 Changed: ${filename}`);
        runTests();
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not watch ${path}: ${error.message}`);
  }
});

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping file watcher...\n');
  process.exit(0);
});

// Keep process alive
process.stdin.resume();