/**
 * Text Component - Renders styled text in the TUI
 */

import { ansi } from '@ferroframe/core';

export function Text(props = {}) {
  const {
    children = '',
    color,
    bold = false,
    italic = false,
    underline = false,
    strikethrough = false,
    dim = false,
    align = 'left',
    width,
    wrap = true,
    ...rest
  } = props;
  
  // Create component structure
  const component = {
    type: 'text',
    content: children,
    style: {
      color,
      bold,
      italic,
      underline,
      strikethrough,
      dim,
      align,
      width,
      wrap,
      ...rest,
    },
    
    // Render method for converting to string
    render() {
      let text = this.content;
      
      // Apply text alignment if width is specified
      if (width && align) {
        text = ansi.padText(text, width, align);
      }
      
      // Apply text styles
      const styles = [];
      if (bold) styles.push(ansi.style.bold);
      if (italic) styles.push(ansi.style.italic);
      if (underline) styles.push(ansi.style.underline);
      if (strikethrough) styles.push(ansi.style.strikethrough);
      if (dim) styles.push(ansi.style.dim);
      
      // Apply color
      if (color) {
        const colorStyle = ansi.style[color];
        if (colorStyle) {
          styles.push(colorStyle);
        }
      }
      
      if (styles.length > 0) {
        text = ansi.applyStyle(text, ...styles);
      }
      
      return text;
    },
  };
  
  return component;
}