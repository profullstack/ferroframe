# FerroFrame 🦀

> A Svelte-host TUI framework for Node.js - Build terminal interfaces with the power of Svelte

FerroFrame brings the declarative, component-based approach of Svelte to terminal user interfaces. Write TUIs using familiar web development patterns while leveraging Svelte's reactivity and compilation optimizations.

## ✨ Features

- **Svelte Components**: Write TUI components using Svelte's syntax and reactivity
- **Flexbox Layout**: Familiar CSS-like flexbox layout system for terminals
- **Reactive Updates**: Efficient rendering with Svelte's fine-grained reactivity
- **Component Library**: Built-in components for common TUI patterns
- **Developer Experience**: Hot reload, debugging tools, and great DX
- **Cross-Platform**: Works on Windows, macOS, and Linux terminals
- **CLI Tool**: Powerful `ferro` command for all operations

## 🚀 Quick Start

```bash
# Install FerroFrame CLI globally
pnpm add -g @profullstack/ferroframe

# Create a new FerroFrame app
ferro new my-tui-app

# Navigate to your app
cd my-tui-app

# Start development server
ferro dev
```

## 📦 Installation

### Global CLI Installation
```bash
# Install the FerroFrame CLI globally
pnpm add -g @profullstack/ferroframe

# Verify installation
ferro --version
```

### Project Dependencies
```bash
# Add to existing project
pnpm add @ferroframe/core @ferroframe/components

# For Svelte integration
pnpm add @ferroframe/svelte-adapter svelte
```

## 🛠️ CLI Commands

The `ferro` CLI provides a unified interface for all FerroFrame operations:

### Creating Apps

```bash
# Create a new FerroFrame app (interactive)
ferro new my-app

# Create with specific template
ferro create my-svelte-app
# Then choose: 1) Basic TUI App or 2) Svelte TUI App
```

### Development

```bash
# Start development server with hot reload
ferro dev                        # Shows help
ferro dev core                   # Watch core package
ferro dev components             # Watch components package
ferro dev svelte-adapter         # Watch svelte-adapter
ferro dev example hello-world    # Run hello-world example
ferro dev example svelte-todo    # Run svelte-todo example
```

### Building & Testing

```bash
# Build all packages for production
ferro build

# Run tests
ferro test

# Watch files and run tests automatically
ferro watch

# Lint your code
ferro lint

# Format code with Prettier
ferro format
```

### Help & Info

```bash
# Show all available commands
ferro help
ferro --help
ferro -h

# Show version
ferro version
ferro --version
ferro -v
```

## 🎯 Basic Example

### Using Components Directly

```javascript
// main.js
import { FerroHost } from '@ferroframe/core';
import { Box, Text, Input, Button } from '@ferroframe/components';

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
    Input({
      placeholder: 'Enter your name...',
      onSubmit: (value) => console.log(`Hello, ${value}!`)
    }),
    Button({
      children: 'Click me!',
      variant: 'primary',
      onClick: () => console.log('Button clicked!')
    })
  ]
});

const host = new FerroHost();
await host.mount(app);
```

### Using Svelte Components

```svelte
<!-- App.svelte -->
<script>
  import { Box, Text, Input, Button } from '@ferroframe/components';
  import { createFormStore } from '@ferroframe/svelte-adapter';
  
  const form = createFormStore({
    name: '',
    email: ''
  });
  
  function handleSubmit() {
    console.log('Form submitted:', $form);
  }
</script>

<Box direction="column" padding={2}>
  <Text bold color="cyan">Welcome to FerroFrame!</Text>
  
  <Box direction="row" gap={1}>
    <Input 
      placeholder="Name" 
      value={$form.name}
      onChange={(v) => form.setFieldValue('name', v)}
    />
    <Input 
      placeholder="Email" 
      value={$form.email}
      onChange={(v) => form.setFieldValue('email', v)}
    />
  </Box>
  
  <Button onClick={handleSubmit} variant="primary">
    Submit
  </Button>
</Box>
```

```javascript
// main.js
import { FerroHost } from '@ferroframe/core';
import { SvelteAdapter } from '@ferroframe/svelte-adapter';
import App from './App.svelte';

const adapter = new SvelteAdapter();
const app = await adapter.mount(App);

const host = new FerroHost();
await host.mount(app);
```

## 🏗️ Architecture

FerroFrame uses a host-based architecture where:

1. **Host Layer**: Manages the terminal, input, and rendering lifecycle
2. **Component Layer**: Svelte components that declare the UI
3. **Layout Engine**: Calculates positions using flexbox algorithms
4. **Renderer**: Efficiently draws to the terminal using ANSI sequences

## 📚 Documentation

Documentation is coming soon. For now, please refer to:
- The examples in the `examples/` directory
- The source code in `packages/` for implementation details
- The CLI help: `ferro help`

<!-- Future documentation:
- Getting Started Guide
- API Reference
- Component Library Documentation
- Layout System Guide
- More Examples
-->

## 🧩 Built-in Components

- `Box` - Flexbox container with borders and padding
- `Text` - Styled text rendering with colors
- `Input` - Text input field with cursor management
- `Button` - Interactive button with variants
- `List` - Scrollable, selectable list
- More components coming soon!

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/profullstack/ferroframe.git
cd ferroframe

# Install dependencies
pnpm install

# Run tests
ferro test
# or
pnpm test

# Build all packages
ferro build
# or
pnpm build

# Watch mode for development
ferro watch
# or
pnpm watch

# Run specific example
ferro dev example hello-world
ferro dev example svelte-todo
```

## 📖 Examples

Check out the [examples](examples/) directory for:

- [Hello World](examples/hello-world) - Basic interactive counter
- [Svelte Todo](examples/svelte-todo) - Todo app with Svelte stores

Run examples using the CLI:
```bash
# Run hello-world example
ferro dev example hello-world

# Run svelte-todo example  
ferro dev example svelte-todo
```

## 🎨 Styling & Theming

FerroFrame supports comprehensive styling options:

```javascript
import { Box, Text } from '@ferroframe/components';

Box({
  // Flexbox properties
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 2,
  
  // Box model
  padding: 2,
  margin: 1,
  
  // Borders
  border: 'single',
  borderColor: 'cyan',
  
  // Sizing
  width: 50,
  height: 20,
  
  children: [
    Text({
      children: 'Styled Text',
      color: 'green',
      backgroundColor: 'black',
      bold: true,
      underline: true
    })
  ]
});
```

## 🚦 Project Status

**Current Version**: 0.3.0
**Status**: ✅ Production Ready - All core features implemented

### Completed Features:
- ✅ Core TUI framework with host and renderer
- ✅ Complete flexbox layout engine
- ✅ Component system with lifecycle management
- ✅ Built-in component library
- ✅ Svelte adapter with reactive stores
- ✅ CLI tool with `ferro` command
- ✅ Development tools (hot reload, watch mode)
- ✅ Project scaffolding
- ✅ Working examples

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Profullstack, Inc.

## 🙏 Acknowledgments

- Inspired by [Ink](https://github.com/vadimdemedes/ink) and [Blessed](https://github.com/chjj/blessed)
- Built with [Svelte](https://svelte.dev)
- Terminal rendering powered by ANSI escape sequences

---

**Ready to build your next TUI?** Get started with `ferro new my-app` 🚀