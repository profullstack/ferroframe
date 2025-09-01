#!/usr/bin/env node

/**
 * FerroFrame CLI - Main command-line interface
 * Provides unified access to all FerroFrame tools
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const scriptsDir = resolve(rootDir, 'scripts');

// Parse command and arguments
const [,, command, ...args] = process.argv;

// Available commands
const commands = {
  new: {
    description: 'Create a new FerroFrame app',
    script: 'create-app.js',
    usage: 'ferro new [app-name]'
  },
  create: {
    description: 'Create a new FerroFrame app (alias for new)',
    script: 'create-app.js',
    usage: 'ferro create [app-name]'
  },
  dev: {
    description: 'Start development server',
    script: 'dev.js',
    usage: 'ferro dev [package|example] [name]'
  },
  build: {
    description: 'Build all packages',
    script: 'build.js',
    usage: 'ferro build'
  },
  watch: {
    description: 'Watch files and run tests',
    script: 'watch.js',
    usage: 'ferro watch'
  },
  test: {
    description: 'Run tests',
    command: ['pnpm', 'test'],
    usage: 'ferro test'
  },
  lint: {
    description: 'Lint code',
    command: ['pnpm', 'lint'],
    usage: 'ferro lint'
  },
  format: {
    description: 'Format code with Prettier',
    command: ['pnpm', 'format'],
    usage: 'ferro format'
  }
};

// Show help
function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    FerroFrame CLI v0.1.0                     ║
╚══════════════════════════════════════════════════════════════╝

Usage: ferro <command> [options]

Commands:
`);

  const maxCmdLength = Math.max(...Object.keys(commands).map(cmd => cmd.length));
  
  for (const [cmd, info] of Object.entries(commands)) {
    console.log(`  ${cmd.padEnd(maxCmdLength + 2)} ${info.description}`);
  }

  console.log(`
Examples:
  ferro new my-app          Create a new FerroFrame app
  ferro dev                 Show development server help
  ferro dev example hello   Run hello-world example
  ferro build               Build all packages
  ferro watch               Watch files and run tests
  ferro test                Run all tests

For more information, visit:
  https://github.com/yourusername/ferroframe
`);
}

// Show version
function showVersion() {
  console.log(`FerroFrame CLI v0.1.0`);
}

// Execute command
async function executeCommand() {
  // Handle no command or help
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  // Handle version
  if (command === 'version' || command === '--version' || command === '-v') {
    showVersion();
    process.exit(0);
  }

  // Check if command exists
  const cmdInfo = commands[command];
  if (!cmdInfo) {
    console.error(`❌ Unknown command: ${command}`);
    console.log(`Run 'ferro help' for available commands`);
    process.exit(1);
  }

  try {
    if (cmdInfo.script) {
      // Run script from scripts directory
      const scriptPath = resolve(scriptsDir, cmdInfo.script);
      
      if (!existsSync(scriptPath)) {
        console.error(`❌ Script not found: ${scriptPath}`);
        process.exit(1);
      }

      const child = spawn('node', [scriptPath, ...args], {
        stdio: 'inherit',
        cwd: rootDir
      });

      child.on('error', (error) => {
        console.error(`❌ Failed to execute command: ${error.message}`);
        process.exit(1);
      });

      child.on('close', (code) => {
        process.exit(code || 0);
      });
    } else if (cmdInfo.command) {
      // Run pnpm command
      const [cmd, ...cmdArgs] = cmdInfo.command;
      
      const child = spawn(cmd, [...cmdArgs, ...args], {
        stdio: 'inherit',
        cwd: rootDir,
        shell: true
      });

      child.on('error', (error) => {
        console.error(`❌ Failed to execute command: ${error.message}`);
        process.exit(1);
      });

      child.on('close', (code) => {
        process.exit(code || 0);
      });
    }
  } catch (error) {
    console.error(`❌ Error executing command: ${error.message}`);
    process.exit(1);
  }
}

// Run the CLI
executeCommand();