/**
 * Input Component - Text input field for TUI
 */

import { ansi } from '@ferroframe/core';

export function Input(props = {}) {
  const {
    value = '',
    placeholder = '',
    type = 'text',
    focused = false,
    disabled = false,
    width = 20,
    onChange,
    onSubmit,
    onFocus,
    onBlur,
    ...rest
  } = props;
  
  // Create component structure
  const component = {
    type: 'input',
    value,
    placeholder,
    inputType: type,
    focused,
    disabled,
    cursorPosition: value.length,
    style: {
      width,
      ...rest,
    },
    
    // Event handlers
    onChange,
    onSubmit,
    onFocus,
    onBlur,
    
    // Handle input change
    handleChange(newValue) {
      this.value = newValue;
      this.cursorPosition = newValue.length;
      
      if (this.onChange) {
        this.onChange(newValue);
      }
    },
    
    // Handle key input
    handleKeyPress(key) {
      if (this.disabled) {
        return;
      }
      
      if (key.name === 'enter') {
        if (this.onSubmit) {
          this.onSubmit(this.value);
        }
      } else if (key.name === 'backspace') {
        if (this.cursorPosition > 0) {
          const newValue = 
            this.value.slice(0, this.cursorPosition - 1) + 
            this.value.slice(this.cursorPosition);
          this.cursorPosition--;
          this.handleChange(newValue);
        }
      } else if (key.name === 'delete') {
        if (this.cursorPosition < this.value.length) {
          const newValue = 
            this.value.slice(0, this.cursorPosition) + 
            this.value.slice(this.cursorPosition + 1);
          this.handleChange(newValue);
        }
      } else if (key.name === 'left') {
        this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      } else if (key.name === 'right') {
        this.cursorPosition = Math.min(this.value.length, this.cursorPosition + 1);
      } else if (key.name === 'home') {
        this.cursorPosition = 0;
      } else if (key.name === 'end') {
        this.cursorPosition = this.value.length;
      } else if (key.name && key.name.length === 1 && !key.ctrl && !key.meta) {
        // Regular character input
        const newValue = 
          this.value.slice(0, this.cursorPosition) + 
          key.name + 
          this.value.slice(this.cursorPosition);
        this.cursorPosition++;
        this.handleChange(newValue);
      }
    },
    
    // Handle focus
    handleFocus() {
      this.focused = true;
      if (this.onFocus) {
        this.onFocus();
      }
    },
    
    // Handle blur
    handleBlur() {
      this.focused = false;
      if (this.onBlur) {
        this.onBlur();
      }
    },
    
    // Render the input field
    render() {
      const displayValue = this.inputType === 'password' 
        ? '*'.repeat(this.value.length)
        : this.value;
      
      const displayText = displayValue || this.placeholder || '';
      
      // Truncate or pad to width
      let content = ansi.padText(displayText, this.style.width - 2, 'left');
      
      // Add cursor if focused
      if (this.focused && this.cursorPosition <= content.length) {
        const before = content.slice(0, this.cursorPosition);
        const at = content[this.cursorPosition] || ' ';
        const after = content.slice(this.cursorPosition + 1);
        
        // Highlight cursor position
        const cursorChar = ansi.applyStyle(at, ansi.style.reverse);
        content = before + cursorChar + after;
      }
      
      // Draw input border
      const borderStyle = this.focused ? ansi.style.cyan : ansi.style.gray;
      const leftBorder = ansi.applyStyle('[', borderStyle);
      const rightBorder = ansi.applyStyle(']', borderStyle);
      
      // Apply disabled style
      if (this.disabled) {
        content = ansi.applyStyle(content, ansi.style.dim);
      }
      
      // Apply placeholder style
      if (!this.value && this.placeholder) {
        content = ansi.applyStyle(content, ansi.style.dim);
      }
      
      return leftBorder + content + rightBorder;
    },
  };
  
  return component;
}