#!/usr/bin/env node

/**
 * CLI tool for scaffolding new FerroFrame applications
 * Creates a new TUI app with all necessary boilerplate
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, cpSync } from 'fs';
import { spawn } from 'child_process';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              Create FerroFrame App 🚀                        ║
╚══════════════════════════════════════════════════════════════╝
`);

// Templates for different app types
const templates = {
  basic: {
    name: 'Basic TUI App',
    description: 'Simple terminal app with FerroFrame components',
    files: {
      'package.json': (name) => ({
        name,
        version: '0.1.0',
        type: 'module',
        scripts: {
          start: 'node src/main.js',
          dev: 'node src/main.js',
          test: 'mocha tests/**/*.test.js'
        },
        dependencies: {
          '@ferroframe/core': '^0.1.0',
          '@ferroframe/components': '^0.1.0'
        },
        devDependencies: {
          mocha: '^10.0.0',
          chai: '^5.0.0'
        }
      }),
      'src/main.js': () => `import { FerroHost } from '@ferroframe/core';
import { Box, Text, Input, Button } from '@ferroframe/components';

// Create your TUI app
const app = Box({
  display: 'flex',
  flexDirection: 'column',
  padding: 2,
  gap: 1,
  children: [
    Text({
      children: 'Welcome to FerroFrame! 🎨',
      bold: true,
      color: 'cyan'
    }),
    Text({
      children: 'A modern TUI framework for Node.js'
    }),
    Box({
      display: 'flex',
      gap: 2,
      marginTop: 1,
      children: [
        Input({
          placeholder: 'Enter your name...',
          width: 20,
          onSubmit: (value) => {
            console.log('Hello,', value);
          }
        }),
        Button({
          children: 'Click me!',
          variant: 'primary',
          onClick: () => {
            console.log('Button clicked!');
          }
        })
      ]
    })
  ]
});

// Start the app
const host = new FerroHost();
await host.mount(app);
`,
      'tests/app.test.js': () => `import { expect } from 'chai';
import { Box, Text } from '@ferroframe/components';

describe('App Tests', () => {
  it('should create a Box component', () => {
    const box = Box({ children: [] });
    expect(box.type).to.equal('box');
  });

  it('should create a Text component', () => {
    const text = Text({ children: 'Hello' });
    expect(text.type).to.equal('text');
    expect(text.props.children).to.equal('Hello');
  });
});
`,
      '.gitignore': () => `node_modules/
dist/
*.log
.DS_Store
`,
      'README.md': (name) => `# ${name}

A FerroFrame TUI application.

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Run the app
pnpm start

# Run in development mode
pnpm dev

# Run tests
pnpm test
\`\`\`

## Built with FerroFrame

[FerroFrame](https://github.com/yourusername/ferroframe) - A Svelte-host TUI framework for Node.js
`
    }
  },
  svelte: {
    name: 'Svelte TUI App',
    description: 'Terminal app with Svelte components and reactivity',
    files: {
      'package.json': (name) => ({
        name,
        version: '0.1.0',
        type: 'module',
        scripts: {
          start: 'node src/main.js',
          dev: 'node src/main.js',
          test: 'mocha tests/**/*.test.js'
        },
        dependencies: {
          '@ferroframe/core': '^0.1.0',
          '@ferroframe/components': '^0.1.0',
          '@ferroframe/svelte-adapter': '^0.1.0',
          'svelte': '^4.0.0'
        },
        devDependencies: {
          mocha: '^10.0.0',
          chai: '^5.0.0'
        }
      }),
      'src/main.js': () => `import { FerroHost } from '@ferroframe/core';
import { SvelteAdapter } from '@ferroframe/svelte-adapter';
import App from './App.svelte';

// Create Svelte adapter
const adapter = new SvelteAdapter();

// Mount Svelte component
const app = await adapter.mount(App, {
  props: {
    name: 'FerroFrame'
  }
});

// Start the TUI host
const host = new FerroHost();
await host.mount(app);
`,
      'src/App.svelte': () => `<script>
  import { Box, Text, Input, Button, List } from '@ferroframe/components';
  import { createFormStore, createListStore } from '@ferroframe/svelte-adapter';
  
  export let name = 'World';
  
  const form = createFormStore({
    username: '',
    message: ''
  });
  
  const messages = createListStore([]);
  
  function sendMessage() {
    if ($form.message.trim()) {
      messages.add(\`[\${$form.username || 'Anonymous'}]: \${$form.message}\`);
      form.setFieldValue('message', '');
    }
  }
</script>

<Box display="flex" flexDirection="column" padding={2} gap={1}>
  <Text bold color="cyan">Hello {name}! 👋</Text>
  <Text>Welcome to your Svelte-powered TUI app</Text>
  
  <Box display="flex" gap={2} marginTop={1}>
    <Input
      placeholder="Your name..."
      value={$form.username}
      onChange={(v) => form.setFieldValue('username', v)}
      width={15}
    />
    <Input
      placeholder="Type a message..."
      value={$form.message}
      onChange={(v) => form.setFieldValue('message', v)}
      onSubmit={sendMessage}
      width={30}
    />
    <Button variant="primary" onClick={sendMessage}>
      Send
    </Button>
  </Box>
  
  <Box marginTop={1} height={10}>
    <Text bold>Messages:</Text>
    <List items={$messages.items} height={8} />
  </Box>
</Box>
`,
      'tests/app.test.js': () => `import { expect } from 'chai';
import { createFormStore, createListStore } from '@ferroframe/svelte-adapter';

describe('Svelte App Tests', () => {
  it('should create a form store', () => {
    const form = createFormStore({ name: '' });
    expect(form).to.have.property('subscribe');
    expect(form).to.have.property('setFieldValue');
  });

  it('should create a list store', () => {
    const list = createListStore([]);
    expect(list).to.have.property('subscribe');
    expect(list).to.have.property('add');
    expect(list).to.have.property('remove');
  });
});
`,
      '.gitignore': () => `node_modules/
dist/
*.log
.DS_Store
`,
      'README.md': (name) => `# ${name}

A Svelte-powered FerroFrame TUI application.

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Run the app
pnpm start

# Run in development mode
pnpm dev

# Run tests
pnpm test
\`\`\`

## Features

- Svelte components in the terminal
- Reactive state management
- Form handling with stores
- List management utilities

## Built with FerroFrame

[FerroFrame](https://github.com/yourusername/ferroframe) - A Svelte-host TUI framework for Node.js
`
    }
  }
};

// Main CLI flow
async function main() {
  try {
    // Get app name
    const appName = await question('📝 App name: ') || 'my-ferroframe-app';
    
    // Select template
    console.log('\n📦 Select a template:\n');
    console.log('  1) Basic TUI App - Simple terminal app with components');
    console.log('  2) Svelte TUI App - Terminal app with Svelte reactivity\n');
    
    const templateChoice = await question('Choose template (1-2): ') || '1';
    const templateKey = templateChoice === '2' ? 'svelte' : 'basic';
    const template = templates[templateKey];
    
    console.log(`\n✨ Creating ${appName} with ${template.name} template...\n`);
    
    // Create app directory
    const appPath = resolve(process.cwd(), appName);
    
    if (existsSync(appPath)) {
      console.error(`❌ Directory ${appName} already exists!`);
      process.exit(1);
    }
    
    mkdirSync(appPath, { recursive: true });
    mkdirSync(resolve(appPath, 'src'));
    mkdirSync(resolve(appPath, 'tests'));
    
    // Generate files
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = resolve(appPath, filePath);
      const dir = dirname(fullPath);
      
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      const fileContent = typeof content === 'function' ? content(appName) : content;
      
      if (filePath === 'package.json') {
        writeFileSync(fullPath, JSON.stringify(fileContent, null, 2));
      } else {
        writeFileSync(fullPath, fileContent);
      }
      
      console.log(`  ✓ Created ${filePath}`);
    }
    
    // Install dependencies
    console.log('\n📦 Installing dependencies...\n');
    
    await new Promise((resolve, reject) => {
      const child = spawn('pnpm', ['install'], {
        cwd: appPath,
        stdio: 'inherit',
        shell: true
      });
      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error('Failed to install dependencies'));
      });
    });
    
    // Success message
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Success! 🎉                               ║
╚══════════════════════════════════════════════════════════════╝

Your FerroFrame app is ready!

Next steps:
  cd ${appName}
  pnpm start

Happy coding! 🚀
`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as createApp };