/**
 * Box Component - Container component with flexbox layout support
 */

import { ansi } from '@ferroframe/core';

export function Box(props = {}) {
  const {
    children = [],
    width,
    height,
    padding = 0,
    margin = 0,
    border,
    borderColor = 'white',
    display = 'block',
    flexDirection = 'row',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    alignContent = 'stretch',
    gap = 0,
    flexWrap = 'nowrap',
    overflow = 'visible',
    ...rest
  } = props;
  
  // Normalize children to array
  const normalizedChildren = Array.isArray(children) ? children : [children];
  
  // Create component structure
  const component = {
    type: 'box',
    children: normalizedChildren,
    style: {
      width,
      height,
      padding,
      margin,
      border,
      borderColor,
      display,
      flexDirection,
      justifyContent,
      alignItems,
      alignContent,
      gap,
      flexWrap,
      overflow,
      ...rest,
    },
    
    // Render method for the box
    render() {
      // This will be handled by the renderer
      // For now, return a placeholder or delegate to renderer
      return this.renderContent();
    },
    
    // Render the content inside the box
    renderContent() {
      if (!this.children || this.children.length === 0) {
        return '';
      }
      
      // Render children
      const renderedChildren = this.children.map(child => {
        if (typeof child === 'string') {
          return child;
        }
        if (child && typeof child.render === 'function') {
          return child.render();
        }
        return '';
      });
      
      // If border is specified, draw it
      if (border) {
        return this.renderWithBorder(renderedChildren.join('\n'));
      }
      
      return renderedChildren.join('\n');
    },
    
    // Render content with border
    renderWithBorder(content) {
      const boxStyle = border === 'double' ? 'double' : 
                      border === 'rounded' ? 'rounded' :
                      border === 'heavy' ? 'heavy' : 'single';
      
      const actualWidth = width || 20;
      const actualHeight = height || 3;
      
      // Draw the box
      const boxLines = ansi.drawBox(actualWidth, actualHeight, boxStyle);
      
      // Apply border color if specified
      if (borderColor && borderColor !== 'white') {
        const colorStyle = ansi.style[borderColor];
        if (colorStyle) {
          return boxLines.map(line => ansi.applyStyle(line, colorStyle)).join('\n');
        }
      }
      
      // Insert content into box (simplified - real implementation would be more complex)
      const contentLines = content.split('\n');
      const result = [...boxLines];
      
      // Place content inside the box
      for (let i = 0; i < contentLines.length && i < actualHeight - 2; i++) {
        const line = contentLines[i];
        const chars = ansi.box[boxStyle];
        const paddedLine = ansi.padText(line, actualWidth - 2, 'left');
        result[i + 1] = chars.vertical + paddedLine + chars.vertical;
      }
      
      return result.join('\n');
    },
  };
  
  return component;
}