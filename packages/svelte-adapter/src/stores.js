/**
 * Svelte Stores for TUI - Reactive state management
 */

import { writable, readable, derived, get } from 'svelte/store';

/**
 * Create a TUI-aware writable store
 */
export function tuiWritable(initial, start) {
  const store = writable(initial, start);
  
  // Add TUI-specific functionality
  const tuiStore = {
    ...store,
    
    // Force update all TUI components subscribed to this store
    forceUpdate() {
      store.update(v => v);
    },
    
    // Get current value synchronously
    get() {
      return get(store);
    },
    
    // Set value and trigger TUI update
    setAndUpdate(value) {
      store.set(value);
      this.forceUpdate();
    },
  };
  
  return tuiStore;
}

/**
 * Create a TUI-aware readable store
 */
export function tuiReadable(initial, start) {
  const store = readable(initial, start);
  
  return {
    ...store,
    
    // Get current value synchronously
    get() {
      return get(store);
    },
  };
}

/**
 * Create a TUI-aware derived store
 */
export function tuiDerived(stores, fn, initial) {
  const store = derived(stores, fn, initial);
  
  return {
    ...store,
    
    // Get current value synchronously
    get() {
      return get(store);
    },
  };
}

/**
 * Terminal dimensions store
 */
export const terminalSize = tuiReadable(
  { width: process.stdout.columns || 80, height: process.stdout.rows || 24 },
  (set) => {
    const updateSize = () => {
      set({
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24,
      });
    };
    
    process.stdout.on('resize', updateSize);
    
    return () => {
      process.stdout.off('resize', updateSize);
    };
  }
);

/**
 * Focus management store
 */
export const focusStore = (() => {
  const { subscribe, set, update } = writable(null);
  
  return {
    subscribe,
    
    // Set focused component
    focus(component) {
      set(component);
    },
    
    // Clear focus
    blur() {
      set(null);
    },
    
    // Check if component is focused
    isFocused(component) {
      return get(this) === component;
    },
    
    // Move focus to next component
    focusNext(components) {
      update(current => {
        if (!components || components.length === 0) return null;
        
        const currentIndex = components.indexOf(current);
        const nextIndex = (currentIndex + 1) % components.length;
        
        return components[nextIndex];
      });
    },
    
    // Move focus to previous component
    focusPrevious(components) {
      update(current => {
        if (!components || components.length === 0) return null;
        
        const currentIndex = components.indexOf(current);
        const prevIndex = currentIndex <= 0 
          ? components.length - 1 
          : currentIndex - 1;
        
        return components[prevIndex];
      });
    },
  };
})();

/**
 * Theme store for styling
 */
export const themeStore = tuiWritable({
  name: 'default',
  colors: {
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    danger: 'red',
    warning: 'yellow',
    info: 'cyan',
    text: 'white',
    background: 'black',
  },
  borders: {
    style: 'single',
    color: 'gray',
  },
});

/**
 * Input mode store
 */
export const inputMode = tuiWritable('normal');

/**
 * Application state store
 */
export const appState = tuiWritable({
  isRunning: false,
  error: null,
  loading: false,
});

/**
 * Create a form store for managing form state
 */
export function createFormStore(initialValues = {}) {
  const values = tuiWritable(initialValues);
  const errors = tuiWritable({});
  const touched = tuiWritable({});
  const isSubmitting = tuiWritable(false);
  
  const isValid = derived(
    errors,
    $errors => Object.keys($errors).length === 0
  );
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    
    // Set field value
    setFieldValue(field, value) {
      values.update(v => ({ ...v, [field]: value }));
      touched.update(t => ({ ...t, [field]: true }));
    },
    
    // Set field error
    setFieldError(field, error) {
      errors.update(e => ({ ...e, [field]: error }));
    },
    
    // Clear field error
    clearFieldError(field) {
      errors.update(e => {
        const { [field]: _, ...rest } = e;
        return rest;
      });
    },
    
    // Mark field as touched
    setFieldTouched(field, isTouched = true) {
      touched.update(t => ({ ...t, [field]: isTouched }));
    },
    
    // Reset form
    reset(newValues = initialValues) {
      values.set(newValues);
      errors.set({});
      touched.set({});
      isSubmitting.set(false);
    },
    
    // Submit form
    async submit(handler) {
      isSubmitting.set(true);
      
      try {
        const currentValues = get(values);
        await handler(currentValues);
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        isSubmitting.set(false);
      }
    },
  };
}

/**
 * Create a list store for managing list state
 */
export function createListStore(initialItems = []) {
  const items = tuiWritable(initialItems);
  const selectedIndex = tuiWritable(0);
  const filter = tuiWritable('');
  
  const filteredItems = derived(
    [items, filter],
    ([$items, $filter]) => {
      if (!$filter) return $items;
      
      const lowerFilter = $filter.toLowerCase();
      return $items.filter(item => 
        String(item).toLowerCase().includes(lowerFilter)
      );
    }
  );
  
  const selectedItem = derived(
    [filteredItems, selectedIndex],
    ([$items, $index]) => $items[$index] || null
  );
  
  return {
    items,
    selectedIndex,
    filter,
    filteredItems,
    selectedItem,
    
    // Add item
    add(item) {
      items.update(list => [...list, item]);
    },
    
    // Remove item
    remove(index) {
      items.update(list => list.filter((_, i) => i !== index));
    },
    
    // Update item
    update(index, item) {
      items.update(list => {
        const newList = [...list];
        newList[index] = item;
        return newList;
      });
    },
    
    // Select item
    select(index) {
      const itemCount = get(filteredItems).length;
      if (index >= 0 && index < itemCount) {
        selectedIndex.set(index);
      }
    },
    
    // Move selection up
    selectPrevious() {
      selectedIndex.update(i => Math.max(0, i - 1));
    },
    
    // Move selection down
    selectNext() {
      const itemCount = get(filteredItems).length;
      selectedIndex.update(i => Math.min(itemCount - 1, i + 1));
    },
    
    // Clear selection
    clearSelection() {
      selectedIndex.set(-1);
    },
    
    // Set filter
    setFilter(value) {
      filter.set(value);
      selectedIndex.set(0); // Reset selection when filtering
    },
  };
}

// Export all stores
export {
  writable,
  readable,
  derived,
  get,
};