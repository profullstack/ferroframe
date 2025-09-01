<script>
  import { createListStore } from '@ferroframe/svelte-adapter';
  
  // Create todo store
  const todos = createListStore([]);
  const { items, selectedIndex, filteredItems, selectedItem } = todos;
  
  let newTodoText = '';
  let filter = 'all';
  
  // Add new todo
  function addTodo() {
    if (newTodoText.trim()) {
      todos.add({
        id: Date.now(),
        text: newTodoText.trim(),
        completed: false,
      });
      newTodoText = '';
    }
  }
  
  // Toggle todo completion
  function toggleTodo(index) {
    const todo = $items[index];
    if (todo) {
      todos.update(index, { ...todo, completed: !todo.completed });
    }
  }
  
  // Delete todo
  function deleteTodo(index) {
    todos.remove(index);
  }
  
  // Filter todos
  $: {
    let filterFn = '';
    switch (filter) {
      case 'active':
        filterFn = 'active';
        todos.setFilter('active');
        break;
      case 'completed':
        filterFn = 'completed';
        todos.setFilter('completed');
        break;
      default:
        todos.setFilter('');
    }
  }
  
  // Stats
  $: totalTodos = $items.length;
  $: completedTodos = $items.filter(t => t.completed).length;
  $: activeTodos = totalTodos - completedTodos;
  
  // Keyboard handling
  function handleKeydown(event) {
    switch (event.key) {
      case 'ArrowUp':
        todos.selectPrevious();
        break;
      case 'ArrowDown':
        todos.selectNext();
        break;
      case ' ':
        if ($selectedItem) {
          toggleTodo($selectedIndex);
        }
        break;
      case 'Delete':
        if ($selectedItem) {
          deleteTodo($selectedIndex);
        }
        break;
      case 'Enter':
        if (document.activeElement.id === 'new-todo') {
          addTodo();
        }
        break;
    }
  }
</script>

<div class="todo-app" on:keydown={handleKeydown}>
  <div class="header">
    <h1>📝 FerroFrame Todo</h1>
    <div class="stats">
      {activeTodos} active, {completedTodos} completed
    </div>
  </div>
  
  <div class="input-section">
    <input
      id="new-todo"
      type="text"
      bind:value={newTodoText}
      placeholder="What needs to be done?"
      on:keydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button on:click={addTodo} disabled={!newTodoText.trim()}>
      Add
    </button>
  </div>
  
  <div class="filters">
    <button
      class:active={filter === 'all'}
      on:click={() => filter = 'all'}
    >
      All
    </button>
    <button
      class:active={filter === 'active'}
      on:click={() => filter = 'active'}
    >
      Active
    </button>
    <button
      class:active={filter === 'completed'}
      on:click={() => filter = 'completed'}
    >
      Completed
    </button>
  </div>
  
  <div class="todo-list">
    {#if $filteredItems.length === 0}
      <div class="empty">No todos yet!</div>
    {:else}
      {#each $filteredItems as todo, index}
        <div
          class="todo-item"
          class:selected={index === $selectedIndex}
          class:completed={todo.completed}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            on:change={() => toggleTodo(index)}
          />
          <span class="todo-text">{todo.text}</span>
          <button
            class="delete"
            on:click={() => deleteTodo(index)}
          >
            ✕
          </button>
        </div>
      {/each}
    {/if}
  </div>
  
  <div class="help">
    Use ↑↓ to navigate, Space to toggle, Delete to remove
  </div>
</div>

<style>
  /* These styles won't apply in TUI but help with structure */
  .todo-app {
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .input-section {
    display: flex;
    gap: 5px;
  }
  
  .filters {
    display: flex;
    gap: 10px;
  }
  
  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .todo-item.selected {
    background: rgba(0, 123, 255, 0.1);
  }
  
  .todo-item.completed .todo-text {
    text-decoration: line-through;
    opacity: 0.5;
  }
  
  .help {
    font-size: 0.9em;
    opacity: 0.7;
  }
</style>