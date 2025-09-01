# FerroFrame Development TODO

## 🎯 MVP Phase 1: Core Foundation

### Project Setup
- [ ] Initialize project with pnpm and ESM configuration
- [ ] Set up ESLint and Prettier configurations
- [ ] Create basic directory structure
- [ ] Configure test framework (Mocha + Chai)
- [ ] Set up development scripts

### Core Host Module
- [ ] Create `FerroHost` class for managing TUI lifecycle
- [ ] Implement terminal initialization and cleanup
- [ ] Create screen buffer management
- [ ] Add dirty region tracking for efficient rendering
- [ ] Implement component tree management

### Renderer System
- [ ] Create `Renderer` class for drawing to terminal
- [ ] Implement ANSI escape sequence handling
- [ ] Add text rendering with styles (colors, bold, etc.)
- [ ] Create box drawing utilities
- [ ] Implement clear and refresh operations

### Layout Engine
- [ ] Create `Layout` module with flexbox-style calculations
- [ ] Implement `Box` component with flex properties
- [ ] Add padding and margin support
- [ ] Create alignment utilities (justify, align-items)
- [ ] Implement size constraints (min/max width/height)

### Component System
- [ ] Create base `Component` class
- [ ] Implement component lifecycle (mount, update, unmount)
- [ ] Add props and state management
- [ ] Create component registry
- [ ] Implement component diffing for updates

### Input Handling
- [ ] Create `InputManager` for keyboard events
- [ ] Implement focus management
- [ ] Add keyboard navigation (Tab, Arrow keys)
- [ ] Create event bubbling system
- [ ] Add mouse support (optional for MVP)

### Basic Components
- [ ] `Text` component with styling
- [ ] `Box` container component
- [ ] `Input` text field component
- [ ] `Button` interactive component
- [ ] `List` component for selections

## 🎯 MVP Phase 2: Svelte Integration

### Svelte Compiler Integration
- [ ] Create Svelte component adapter
- [ ] Implement reactive store bindings
- [ ] Add component slot support
- [ ] Create lifecycle hook mappings
- [ ] Implement event handling bridge

### Developer Experience
- [ ] Create CLI tool for project scaffolding
- [ ] Add hot reload support
- [ ] Create debug mode with component inspector
- [ ] Add performance profiling
- [ ] Create documentation site

## 🎯 MVP Phase 3: Examples & Testing

### Example Applications
- [ ] Simple "Hello World" app
- [ ] Todo list application
- [ ] Form with validation
- [ ] Dashboard with multiple panels
- [ ] File explorer component

### Testing Suite
- [ ] Unit tests for core modules
- [ ] Integration tests for component system
- [ ] Layout engine test cases
- [ ] Input handling tests
- [ ] Performance benchmarks

## 📁 MVP File Structure

```
ferroframe/
├── package.json
├── pnpm-workspace.yaml
├── .eslintrc.json
├── .prettierrc
├── TODO.md
├── README.md
├── LICENSE
│
├── packages/
│   ├── core/                    # Core TUI framework
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── host.js         # FerroHost class
│   │   │   ├── renderer.js     # Terminal renderer
│   │   │   ├── layout.js       # Layout engine
│   │   │   ├── component.js    # Base component
│   │   │   ├── input.js        # Input manager
│   │   │   └── utils/
│   │   │       ├── ansi.js     # ANSI utilities
│   │   │       ├── buffer.js   # Screen buffer
│   │   │       └── events.js   # Event system
│   │   └── tests/
│   │       ├── host.test.js
│   │       ├── renderer.test.js
│   │       ├── layout.test.js
│   │       └── component.test.js
│   │
│   ├── components/              # Built-in components
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── Text.js
│   │   │   ├── Box.js
│   │   │   ├── Input.js
│   │   │   ├── Button.js
│   │   │   ├── List.js
│   │   │   └── styles.js      # Component styles
│   │   └── tests/
│   │       └── components.test.js
│   │
│   └── svelte-adapter/         # Svelte integration
│       ├── package.json
│       ├── src/
│       │   ├── index.js
│       │   ├── compiler.js    # Svelte compiler bridge
│       │   ├── adapter.js     # Component adapter
│       │   └── stores.js      # Reactive stores
│       └── tests/
│           └── adapter.test.js
│
├── examples/
│   ├── hello-world/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── App.svelte
│   │   │   └── main.js
│   │   └── README.md
│   │
│   ├── todo-app/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── App.svelte
│   │   │   ├── TodoItem.svelte
│   │   │   ├── TodoList.svelte
│   │   │   └── main.js
│   │   └── README.md
│   │
│   └── dashboard/
│       ├── package.json
│       ├── src/
│       │   ├── App.svelte
│       │   ├── Panel.svelte
│       │   ├── Chart.svelte
│       │   └── main.js
│       └── README.md
│
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── components.md
│   ├── layout-system.md
│   └── examples.md
│
└── scripts/
    ├── create-app.js          # CLI scaffolding tool
    ├── dev.js                 # Development server
    └── build.js               # Build script
```

## 🚀 Development Workflow

1. **Phase 1 Priority**: Core foundation (1-2 weeks)
   - Start with basic terminal rendering
   - Implement minimal component system
   - Get basic input working

2. **Phase 2 Priority**: Svelte integration (1 week)
   - Create adapter for Svelte components
   - Implement reactive updates
   - Test with simple examples

3. **Phase 3 Priority**: Polish & Examples (1 week)
   - Create comprehensive examples
   - Write documentation
   - Add developer tools

## 📝 Notes

- Keep it simple initially - no complex optimizations
- Focus on developer experience early
- Test on multiple terminal emulators
- Consider Windows Terminal support
- Performance benchmarks after MVP