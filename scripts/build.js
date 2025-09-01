#!/usr/bin/env node

/**
 * Build script for FerroFrame
 * Builds all packages and prepares for publishing
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    FerroFrame Builder                        ║
╚══════════════════════════════════════════════════════════════╝
`);

// Build steps
const steps = [
  {
    name: 'Clean dist directories',
    action: async () => {
      const packages = ['core', 'components', 'svelte-adapter'];
      for (const pkg of packages) {
        const distPath = resolve(rootDir, 'packages', pkg, 'dist');
        if (existsSync(distPath)) {
          console.log(`  Cleaning ${pkg}/dist...`);
          cpSync(distPath, distPath + '.bak', { recursive: true });
        }
      }
    }
  },
  {
    name: 'Run tests',
    action: () => {
      return new Promise((resolve, reject) => {
        const child = spawn('pnpm', ['test'], {
          cwd: rootDir,
          stdio: 'inherit',
          shell: true
        });
        child.on('close', code => {
          if (code === 0) resolve();
          else reject(new Error(`Tests failed with code ${code}`));
        });
      });
    }
  },
  {
    name: 'Lint code',
    action: () => {
      return new Promise((resolve, reject) => {
        const child = spawn('pnpm', ['lint'], {
          cwd: rootDir,
          stdio: 'inherit',
          shell: true
        });
        child.on('close', code => {
          if (code === 0) resolve();
          else reject(new Error(`Linting failed with code ${code}`));
        });
      });
    }
  },
  {
    name: 'Build packages',
    action: async () => {
      const packages = [
        { name: 'core', path: 'packages/core' },
        { name: 'components', path: 'packages/components' },
        { name: 'svelte-adapter', path: 'packages/svelte-adapter' }
      ];

      for (const pkg of packages) {
        console.log(`  Building @ferroframe/${pkg.name}...`);
        
        const srcPath = resolve(rootDir, pkg.path, 'src');
        const distPath = resolve(rootDir, pkg.path, 'dist');
        
        // Create dist directory
        if (!existsSync(distPath)) {
          mkdirSync(distPath, { recursive: true });
        }
        
        // Copy source files to dist (for now, just copy - could add bundling later)
        cpSync(srcPath, distPath, { recursive: true });
        
        // Update package.json exports
        const pkgJsonPath = resolve(rootDir, pkg.path, 'package.json');
        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
        
        if (!pkgJson.exports) {
          pkgJson.exports = {
            '.': './dist/index.js'
          };
        }
        
        pkgJson.main = './dist/index.js';
        pkgJson.files = ['dist'];
        
        writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
        console.log(`    ✓ ${pkg.name} built`);
      }
    }
  },
  {
    name: 'Build examples',
    action: async () => {
      const examples = ['hello-world', 'svelte-todo'];
      
      for (const example of examples) {
        console.log(`  Building example: ${example}...`);
        
        const examplePath = resolve(rootDir, 'examples', example);
        
        // Install dependencies
        await new Promise((resolve, reject) => {
          const child = spawn('pnpm', ['install'], {
            cwd: examplePath,
            stdio: 'inherit',
            shell: true
          });
          child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`Install failed for ${example}`));
          });
        });
        
        console.log(`    ✓ ${example} ready`);
      }
    }
  }
];

// Run build steps
async function build() {
  for (const step of steps) {
    console.log(`\n📦 ${step.name}...`);
    try {
      await step.action();
      console.log(`✅ ${step.name} completed`);
    } catch (error) {
      console.error(`❌ ${step.name} failed:`, error.message);
      process.exit(1);
    }
  }
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Build Successful! 🎉                      ║
╚══════════════════════════════════════════════════════════════╝

Packages built:
  ✓ @ferroframe/core
  ✓ @ferroframe/components  
  ✓ @ferroframe/svelte-adapter

Examples ready:
  ✓ hello-world
  ✓ svelte-todo

Next steps:
  • Run examples: pnpm dev example hello-world
  • Create new app: pnpm create-app my-tui-app
  • Publish packages: pnpm publish -r
`);
}

// Run the build
build().catch(error => {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
});