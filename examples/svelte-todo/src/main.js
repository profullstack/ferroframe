/**
 * FerroFrame Svelte Todo Example
 * Demonstrates Svelte component integration with TUI
 */

import { FerroHost } from '@ferroframe/core';
import { Box, Text, Input, Button, List } from '@ferroframe/components';
import { createListStore } from '@ferroframe/svelte-adapter';

// Create todo store
const todos = createListStore([]);

// Create the UI using regular components (simplified version without full Svelte compilation)
function createTodoApp() {
  let newTodoText = '';
  let filter = 'all';
  
  const addTodo = () => {
    if (newTodoText.trim()) {
      todos.add({
        id: Date.now(),
        text: newTodoText.trim(),
        completed: false,
      });
      newTodoText = '';
    }
  };
  
  const toggleTodo = (index) => {
    const items = todos.items.get();
    const todo = items[index];
    if (todo) {
      todos.update(index, { ...todo, completed: !todo.completed });
    }
  };
  
  const deleteTodo = (index) => {
    todos.remove(index);
  };
  
  // Create the app component
  return Box({
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    gap: 5,
    children: [
      // Header
      Box({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        children: [
          Text({ 
            children: '📝 FerroFrame Todo', 
            bold: true, 
            color: 'cyan' 
          }),
          Text({ 
            children: () => {
              const items = todos.items.get();
              const active = items.filter(t => !t.completed).length;
              const completed = items.filter(t => t.completed).length;
              return `${active} active, ${completed} completed`;
            },
            color: 'gray'
          }),
        ],
      }),
      
      // Input section
      Box({
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        children: [
          Input({
            placeholder: 'What needs to be done?',
            width: 30,
            value: newTodoText,
            onChange: (value) => { newTodoText = value; },
            onSubmit: addTodo,
          }),
          Button({
            children: 'Add',
            variant: 'primary',
            onClick: addTodo,
          }),
        ],
      }),
      
      // Filter buttons
      Box({
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        children: [
          Button({
            children: 'All',
            variant: filter === 'all' ? 'primary' : 'secondary',
            onClick: () => {
              filter = 'all';
              todos.setFilter('');
            },
          }),
          Button({
            children: 'Active',
            variant: filter === 'active' ? 'primary' : 'secondary',
            onClick: () => {
              filter = 'active';
              todos.setFilter('active');
            },
          }),
          Button({
            children: 'Completed',
            variant: filter === 'completed' ? 'primary' : 'secondary',
            onClick: () => {
              filter = 'completed';
              todos.setFilter('completed');
            },
          }),
        ],
      }),
      
      // Todo list
      Box({
        border: 'single',
        padding: 5,
        height: 15,
        children: [
          List({
            items: () => {
              const items = todos.filteredItems.get();
              if (filter === 'active') {
                return items.filter(t => !t.completed);
              } else if (filter === 'completed') {
                return items.filter(t => t.completed);
              }
              return items;
            },
            renderItem: (todo) => {
              const checkbox = todo.completed ? '[✓]' : '[ ]';
              const text = todo.completed 
                ? `~~${todo.text}~~` 
                : todo.text;
              return `${checkbox} ${text}`;
            },
            height: 10,
            scrollable: true,
            onSelect: (todo, index) => {
              toggleTodo(index);
            },
          }),
        ],
      }),
      
      // Help text
      Text({
        children: 'Use ↑↓ to navigate, Enter to toggle, q to quit',
        color: 'gray',
        dim: true,
      }),
    ],
  });
}

// Main application
async function main() {
  console.log('Starting FerroFrame Svelte Todo App...\n');
  
  // Add some initial todos
  todos.add({ id: 1, text: 'Learn FerroFrame', completed: false });
  todos.add({ id: 2, text: 'Build a TUI app', completed: false });
  todos.add({ id: 3, text: 'Integrate Svelte', completed: false });
  
  // Create host instance
  const host = new FerroHost({
    fullscreen: false,
    title: 'FerroFrame Todo',
  });
  
  try {
    // Create and mount the app
    const app = createTodoApp();
    await host.mount(app);
    
    // Update loop for reactive stores
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