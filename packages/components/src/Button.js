/**
 * Button Component - Interactive button for TUI
 */

import { ansi } from '@ferroframe/core';

export function Button(props = {}) {
  const {
    children = 'Button',
    onClick,
    disabled = false,
    variant = 'default',
    focused = false,
    width,
    ...rest
  } = props;
  
  // Create component structure
  const component = {
    type: 'button',
    label: children,
    onClick,
    disabled,
    variant,
    focused,
    pressed: false,
    style: {
      width,
      ...rest,
    },
    
    // Handle click event
    handleClick() {
      if (this.disabled) {
        return;
      }
      
      this.pressed = true;
      
      if (this.onClick) {
        this.onClick();
      }
      
      // Reset pressed state after a moment
      setTimeout(() => {
        this.pressed = false;
      }, 100);
    },
    
    // Handle key press
    handleKeyPress(key) {
      if (this.disabled || !this.focused) {
        return;
      }
      
      if (key.name === 'enter' || key.name === ' ') {
        this.handleClick();
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
    
    // Render the button
    render() {
      let label = this.label;
      
      // Pad label if width is specified
      if (this.style.width) {
        label = ansi.padText(label, this.style.width - 4, 'center');
      }
      
      // Determine button style based on variant and state
      let bgColor, fgColor, borderStyle;
      
      if (this.disabled) {
        bgColor = ansi.style.bgGray;
        fgColor = ansi.style.dim;
        borderStyle = ansi.style.dim;
      } else if (this.pressed) {
        bgColor = ansi.style.bgWhite;
        fgColor = ansi.style.black;
        borderStyle = ansi.style.white;
      } else if (this.focused) {
        switch (this.variant) {
          case 'primary':
            bgColor = ansi.style.bgBlue;
            fgColor = ansi.style.white;
            borderStyle = ansi.style.brightBlue;
            break;
          case 'secondary':
            bgColor = ansi.style.bgGray;
            fgColor = ansi.style.white;
            borderStyle = ansi.style.brightWhite;
            break;
          case 'danger':
            bgColor = ansi.style.bgRed;
            fgColor = ansi.style.white;
            borderStyle = ansi.style.brightRed;
            break;
          case 'success':
            bgColor = ansi.style.bgGreen;
            fgColor = ansi.style.white;
            borderStyle = ansi.style.brightGreen;
            break;
          default:
            bgColor = '';
            fgColor = ansi.style.white;
            borderStyle = ansi.style.cyan;
        }
      } else {
        switch (this.variant) {
          case 'primary':
            bgColor = '';
            fgColor = ansi.style.blue;
            borderStyle = ansi.style.blue;
            break;
          case 'secondary':
            bgColor = '';
            fgColor = ansi.style.gray;
            borderStyle = ansi.style.gray;
            break;
          case 'danger':
            bgColor = '';
            fgColor = ansi.style.red;
            borderStyle = ansi.style.red;
            break;
          case 'success':
            bgColor = '';
            fgColor = ansi.style.green;
            borderStyle = ansi.style.green;
            break;
          default:
            bgColor = '';
            fgColor = ansi.style.white;
            borderStyle = ansi.style.white;
        }
      }
      
      // Apply styles to label
      let styledLabel = label;
      if (bgColor || fgColor) {
        const styles = [];
        if (bgColor) styles.push(bgColor);
        if (fgColor) styles.push(fgColor);
        if (this.focused) styles.push(ansi.style.bold);
        styledLabel = ansi.applyStyle(label, ...styles);
      }
      
      // Create button with borders
      const leftBorder = ansi.applyStyle('[ ', borderStyle);
      const rightBorder = ansi.applyStyle(' ]', borderStyle);
      
      return leftBorder + styledLabel + rightBorder;
    },
  };
  
  return component;
}