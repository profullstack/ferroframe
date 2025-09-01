#!/usr/bin/env node

/**
 * Development script for FerroFrame
 * Provides watch mode and hot reload for development
 */

import { spawn } from 'child_process';
import { watch } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const packageName = args[0];
const exampleName = args[1];

if (!packageName && !exampleName) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    FerroFrame Dev Server                     ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  pnpm dev                     # Show this help
  pnpm dev core                # Watch core package
  pnpm dev components          # Watch components package  
  pnpm dev svelte-adapter      # Watch svelte-adapter package
  pnpm dev example hello-world # Run hello-world example
  pnpm dev example svelte-todo # Run svelte-todo example

Options:
  --watch    Enable file watching (default)
  --no-watch Disable file watching
`);
  process.exit(0);
}

// Handle example development
if (packageName === 'example' && exampleName) {
  const examplePath = resolve(rootDir, 'examples', exampleName);
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  Running ${exampleName.padEnd(20)}          ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Run the example
  const child = spawn('node', ['src/main.js'], {
    cwd: examplePath,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // Watch for changes if not disabled
  if (!args.includes('--no-watch')) {
    const watchPaths = [
      resolve(rootDir, 'packages/core/src'),
      resolve(rootDir, 'packages/components/src'),
      resolve(rootDir, 'packages/svelte-adapter/src'),
      resolve(examplePath, 'src')
    ];

    console.log('\n📁 Watching for changes...\n');

    let restartTimeout;
    const restart = () => {
      if (restartTimeout) clearTimeout(restartTimeout);
      restartTimeout = setTimeout(() => {
        console.log('\n🔄 Restarting due to file change...\n');
        child.kill();
        spawn('node', ['scripts/dev.js', 'example', exampleName], {
          cwd: rootDir,
          stdio: 'inherit'
        });
        process.exit();
      }, 100);
    };

    watchPaths.forEach(path => {
      watch(path, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
          console.log(`  Changed: ${filename}`);
          restart();
        }
      });
    });
  }

  // Handle process termination
  process.on('SIGINT', () => {
    child.kill();
    process.exit();
  });

} else if (packageName) {
  // Handle package development
  const packagePath = resolve(rootDir, 'packages', packageName);
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  Watching ${packageName.padEnd(20)}         ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Run tests in watch mode
  const child = spawn('pnpm', ['test', '--watch'], {
    cwd: packagePath,
    stdio: 'inherit',
    shell: true
  });

  // Watch for changes
  const srcPath = resolve(packagePath, 'src');
  const testPath = resolve(packagePath, 'tests');

  console.log('\n📁 Watching for changes...\n');

  watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`  Source changed: ${filename}`);
    }
  });

  watch(testPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`  Test changed: ${filename}`);
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    child.kill();
    process.exit();
  });
}