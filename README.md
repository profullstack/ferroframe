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

## 🚀 Quick Start

```bash
# Create a new FerroFrame app
pnpm create ferroframe my-tui-app
cd my-tui-app
pnpm install
pnpm dev
```

## 📦 Installation

```bash
pnpm add @ferroframe/core @ferroframe/components
```

## 🎯 Basic Example

```svelte
<!-- App.svelte -->
<script>
  import { Box, Text, Input, Button } from '@ferroframe/components';
  
  let name = '';
  let submitted = false;
  
  function handleSubmit() {
    submitted = true;
  }
</script>

<Box direction="column" padding={1}>
  <Text bold color="cyan">Welcome to FerroFrame!</Text>
  
  {#if !submitted}
    <Box direction="row" gap={1}>
      <Text>Name:</Text>
      <Input bind:value={name} placeholder="Enter your name" />
    </Box>
    
    <Button on:click={handleSubmit} disabled={!name}>
      Submit
    </Button>
  {:else}
    <Text color="green">Hello, {name}! 👋</Text>
  {/if}
</Box>
```

```javascript
// main.js
import { FerroHost } from '@ferroframe/core';
import App from './App.svelte';

const host = new FerroHost();
await host.mount(App);
```

## 🏗️ Architecture

FerroFrame uses a host-based architecture where:

1. **Host Layer**: Manages the terminal, input, and rendering lifecycle
2. **Component Layer**: Svelte components that declare the UI
3. **Layout Engine**: Calculates positions using flexbox algorithms
4. **Renderer**: Efficiently draws to the terminal using ANSI sequences

## 📚 Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Component Library](docs/components.md)
- [Layout System](docs/layout-system.md)
- [Examples](docs/examples.md)

## 🧩 Built-in Components

- `Box` - Flexbox container
- `Text` - Styled text rendering
- `Input` - Text input field
- `Button` - Interactive button
- `List` - Selectable list
- `Table` - Data tables
- `Progress` - Progress bars
- `Spinner` - Loading indicators

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/yourusername/ferroframe.git
cd ferroframe

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build packages
pnpm build

# Run examples
cd examples/hello-world
pnpm dev
```

## 📖 Examples

Check out the [examples](examples/) directory for:

- [Hello World](examples/hello-world) - Basic setup
- [Todo App](examples/todo-app) - Interactive todo list
- [Dashboard](examples/dashboard) - Multi-panel dashboard
- [Forms](examples/forms) - Form validation and handling
- [File Explorer](examples/file-explorer) - File system navigation

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © Profullstack, Inc.

## 🙏 Acknowledgments

- Inspired by [Ink](https://github.com/vadimdemedes/ink) and [Blessed](https://github.com/chjj/blessed)
- Built with [Svelte](https://svelte.dev)
- Terminal rendering powered by ANSI escape sequences

---

**Status**: 🚧 Under active development - MVP in progress