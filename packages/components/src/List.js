/**
 * List Component - Scrollable list with selection support
 */

import { ansi } from '@ferroframe/core';

export function List(props = {}) {
  const {
    items = [],
    selectedIndex = 0,
    onSelect,
    renderItem,
    height = 10,
    scrollable = false,
    focused = false,
    selectionIndicator = '▶',
    ...rest
  } = props;
  
  // Create component structure
  const component = {
    type: 'list',
    items,
    selectedIndex,
    onSelect,
    renderItem: renderItem || ((item) => String(item)),
    scrollable,
    focused,
    scrollOffset: 0,
    style: {
      height,
      ...rest,
    },
    
    // Handle selection
    handleSelect(index) {
      if (index >= 0 && index < this.items.length) {
        this.selectedIndex = index;
        
        if (this.onSelect) {
          this.onSelect(this.items[index], index);
        }
        
        // Adjust scroll if needed
        if (this.scrollable) {
          this.ensureVisible(index);
        }
      }
    },
    
    // Ensure selected item is visible
    ensureVisible(index) {
      const visibleHeight = this.style.height;
      
      if (index < this.scrollOffset) {
        this.scrollOffset = index;
      } else if (index >= this.scrollOffset + visibleHeight) {
        this.scrollOffset = index - visibleHeight + 1;
      }
    },
    
    // Handle key press
    handleKeyPress(key) {
      if (!this.focused) {
        return;
      }
      
      if (key.name === 'up') {
        const newIndex = Math.max(0, this.selectedIndex - 1);
        this.handleSelect(newIndex);
      } else if (key.name === 'down') {
        const newIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        this.handleSelect(newIndex);
      } else if (key.name === 'home') {
        this.handleSelect(0);
      } else if (key.name === 'end') {
        this.handleSelect(this.items.length - 1);
      } else if (key.name === 'pageup') {
        const newIndex = Math.max(0, this.selectedIndex - this.style.height);
        this.handleSelect(newIndex);
      } else if (key.name === 'pagedown') {
        const newIndex = Math.min(
          this.items.length - 1, 
          this.selectedIndex + this.style.height
        );
        this.handleSelect(newIndex);
      } else if (key.name === 'enter' || key.name === ' ') {
        // Trigger selection action
        if (this.onSelect) {
          this.onSelect(this.items[this.selectedIndex], this.selectedIndex);
        }
      }
    },
    
    // Handle focus
    handleFocus() {
      this.focused = true;
    },
    
    // Handle blur
    handleBlur() {
      this.focused = false;
    },
    
    // Render the list
    render() {
      if (this.items.length === 0) {
        return ansi.applyStyle('(empty list)', ansi.style.dim);
      }
      
      const lines = [];
      const visibleHeight = this.scrollable ? this.style.height : this.items.length;
      const startIndex = this.scrollable ? this.scrollOffset : 0;
      const endIndex = Math.min(startIndex + visibleHeight, this.items.length);
      
      // Render visible items
      for (let i = startIndex; i < endIndex; i++) {
        const item = this.items[i];
        const isSelected = i === this.selectedIndex;
        
        // Render item content
        let content = this.renderItem(item);
        
        // Add selection indicator
        let line = '';
        if (isSelected) {
          const indicator = ansi.applyStyle(
            selectionIndicator + ' ', 
            this.focused ? ansi.style.cyan : ansi.style.white
          );
          line = indicator + content;
          
          // Highlight selected item
          if (this.focused) {
            line = ansi.applyStyle(line, ansi.style.bold);
          }
        } else {
          line = '  ' + content;
        }
        
        lines.push(line);
      }
      
      // Add scroll indicators if needed
      if (this.scrollable) {
        if (startIndex > 0) {
          lines[0] = ansi.applyStyle('▲ ' + lines[0].slice(2), ansi.style.dim);
        }
        if (endIndex < this.items.length) {
          const lastIndex = lines.length - 1;
          lines[lastIndex] = ansi.applyStyle(
            '▼ ' + lines[lastIndex].slice(2), 
            ansi.style.dim
          );
        }
        
        // Add scrollbar (optional, simplified version)
        if (this.items.length > visibleHeight) {
          const scrollbarHeight = Math.max(
            1, 
            Math.floor(visibleHeight * visibleHeight / this.items.length)
          );
          const scrollbarPosition = Math.floor(
            this.scrollOffset * (visibleHeight - scrollbarHeight) / 
            (this.items.length - visibleHeight)
          );
          
          // Add scrollbar to the right of each line
          for (let i = 0; i < lines.length; i++) {
            const isScrollbar = i >= scrollbarPosition && 
                               i < scrollbarPosition + scrollbarHeight;
            const scrollChar = isScrollbar ? '█' : '│';
            const scrollStyle = isScrollbar ? ansi.style.cyan : ansi.style.dim;
            
            lines[i] += '  ' + ansi.applyStyle(scrollChar, scrollStyle);
          }
        }
      }
      
      // Add border if focused
      if (this.focused) {
        const width = Math.max(...lines.map(l => ansi.measureText(l))) + 2;
        const borderTop = ansi.applyStyle('┌' + '─'.repeat(width - 2) + '┐', ansi.style.cyan);
        const borderBottom = ansi.applyStyle('└' + '─'.repeat(width - 2) + '┘', ansi.style.cyan);
        
        lines.unshift(borderTop);
        lines.push(borderBottom);
        
        // Add side borders
        for (let i = 1; i < lines.length - 1; i++) {
          const paddedLine = ansi.padText(lines[i], width - 2, 'left');
          lines[i] = ansi.applyStyle('│', ansi.style.cyan) + 
                    paddedLine + 
                    ansi.applyStyle('│', ansi.style.cyan);
        }
      }
      
      return lines.join('\n');
    },
  };
  
  return component;
}