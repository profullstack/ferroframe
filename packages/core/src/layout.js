/**
 * Layout System - Flexbox-style layout engine for TUI components
 * Handles positioning, sizing, and arrangement of components
 */

/**
 * LayoutNode represents a single element in the layout tree
 */
export class LayoutNode {
  constructor(style = {}) {
    // Position and dimensions
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    
    // Tree structure
    this.parent = null;
    this.children = [];
    
    // Style properties
    this.style = {
      // Display
      display: 'block', // 'block' | 'flex' | 'none'
      
      // Dimensions
      width: style.width ?? 'auto',
      height: style.height ?? 'auto',
      minWidth: style.minWidth ?? 0,
      minHeight: style.minHeight ?? 0,
      maxWidth: style.maxWidth ?? Infinity,
      maxHeight: style.maxHeight ?? Infinity,
      
      // Box model
      padding: style.padding ?? 0,
      margin: style.margin ?? 0,
      
      // Flexbox properties
      flexDirection: style.flexDirection ?? 'row',
      flexWrap: style.flexWrap ?? 'nowrap',
      justifyContent: style.justifyContent ?? 'flex-start',
      alignItems: style.alignItems ?? 'stretch',
      alignContent: style.alignContent ?? 'stretch',
      gap: style.gap ?? 0,
      
      // Flex item properties
      flexGrow: style.flexGrow ?? 0,
      flexShrink: style.flexShrink ?? 1,
      flexBasis: style.flexBasis ?? 'auto',
      alignSelf: style.alignSelf ?? 'auto',
      
      // Other
      position: style.position ?? 'static',
      overflow: style.overflow ?? 'visible',
      ...style,
    };
    
    // Apply initial dimensions if provided
    if (typeof style.width === 'number') {
      this.width = style.width;
    }
    if (typeof style.height === 'number') {
      this.height = style.height;
    }
  }
  
  /**
   * Add a child node
   */
  appendChild(child) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    
    this.children.push(child);
    child.parent = this;
    
    return child;
  }
  
  /**
   * Remove a child node
   */
  removeChild(child) {
    const index = this.children.indexOf(child);
    
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
    
    return child;
  }
  
  /**
   * Get computed style value
   */
  getStyle(property) {
    return this.style[property];
  }
}

/**
 * Layout engine that calculates positions and sizes
 */
export class Layout {
  constructor() {
    this.containerStack = [];
  }
  
  /**
   * Calculate layout for a node and its children
   */
  calculate(node, availableWidth = null, availableHeight = null) {
    // Use node's dimensions or available space
    const containerWidth = availableWidth ?? node.width;
    const containerHeight = availableHeight ?? node.height;
    
    // Apply constraints first
    this.applyConstraints(node, containerWidth, containerHeight);
    
    // Handle different display types
    if (node.style.display === 'none') {
      node.width = 0;
      node.height = 0;
      return;
    }
    
    if (node.style.display === 'flex') {
      this.calculateFlexLayout(node, containerWidth, containerHeight);
    } else {
      this.calculateBlockLayout(node, containerWidth, containerHeight);
    }
    
    // Recursively calculate children that aren't flex items
    if (node.style.display !== 'flex') {
      for (const child of node.children) {
        this.calculate(child, node.width, node.height);
      }
    }
  }
  
  /**
   * Calculate block layout (default)
   */
  calculateBlockLayout(node) {
    let currentY = 0;
    
    for (const child of node.children) {
      // Position child
      child.x = 0;
      child.y = currentY;
      
      // Calculate child layout
      this.calculate(child, node.width, node.height - currentY);
      
      // Move to next position
      currentY += child.height;
    }
  }
  
  /**
   * Calculate flexbox layout
   */
  calculateFlexLayout(node) {
    const isRow = node.style.flexDirection === 'row';
    const isWrap = node.style.flexWrap === 'wrap';
    const gap = node.style.gap || 0;
    
    // Get content box (accounting for padding)
    const contentBox = this.getContentBox(node);
    const mainSize = isRow ? contentBox.width : contentBox.height;
    const crossSize = isRow ? contentBox.height : contentBox.width;
    
    // First pass: calculate base sizes
    let totalMainSize = 0;
    let totalGrowFactor = 0;
    let totalShrinkFactor = 0;
    
    for (const child of node.children) {
      // Apply constraints to child
      this.applyConstraints(child, contentBox.width, contentBox.height);
      
      // Handle percentage sizes
      if (typeof child.style.width === 'string' && child.style.width.endsWith('%')) {
        const percent = parseFloat(child.style.width) / 100;
        child.width = contentBox.width * percent;
      }
      if (typeof child.style.height === 'string' && child.style.height.endsWith('%')) {
        const percent = parseFloat(child.style.height) / 100;
        child.height = contentBox.height * percent;
      }
      
      const childMainSize = isRow ? child.width : child.height;
      totalMainSize += childMainSize;
      totalGrowFactor += child.style.flexGrow || 0;
      totalShrinkFactor += child.style.flexShrink || 1;
    }
    
    // Add gaps to total size
    if (node.children.length > 1) {
      totalMainSize += gap * (node.children.length - 1);
    }
    
    // Second pass: distribute remaining space
    const remainingSpace = mainSize - totalMainSize;
    
    if (remainingSpace > 0 && totalGrowFactor > 0) {
      // Distribute positive space according to flex-grow
      const spacePerGrow = remainingSpace / totalGrowFactor;
      
      for (const child of node.children) {
        const growFactor = child.style.flexGrow || 0;
        if (growFactor > 0) {
          const growth = spacePerGrow * growFactor;
          if (isRow) {
            child.width += growth;
          } else {
            child.height += growth;
          }
        }
      }
    } else if (remainingSpace < 0 && totalShrinkFactor > 0) {
      // Distribute negative space according to flex-shrink
      const spacePerShrink = remainingSpace / totalShrinkFactor;
      
      for (const child of node.children) {
        const shrinkFactor = child.style.flexShrink || 1;
        if (shrinkFactor > 0) {
          const shrinkage = spacePerShrink * shrinkFactor;
          if (isRow) {
            child.width = Math.max(0, child.width + shrinkage);
          } else {
            child.height = Math.max(0, child.height + shrinkage);
          }
        }
      }
    }
    
    // Third pass: position children
    this.positionFlexItems(node, contentBox, isRow, gap);
  }
  
  /**
   * Position flex items according to justify-content and align-items
   */
  positionFlexItems(node, contentBox, isRow, gap) {
    const justifyContent = node.style.justifyContent;
    const alignItems = node.style.alignItems;
    
    // Calculate total size of all children
    let totalMainSize = 0;
    for (const child of node.children) {
      totalMainSize += isRow ? child.width : child.height;
    }
    totalMainSize += gap * Math.max(0, node.children.length - 1);
    
    // Calculate starting position based on justify-content
    const mainSize = isRow ? contentBox.width : contentBox.height;
    const remainingSpace = mainSize - totalMainSize;
    
    let mainPos = contentBox.x || 0;
    let spacing = 0;
    
    switch (justifyContent) {
      case 'center':
        mainPos += remainingSpace / 2;
        break;
      case 'flex-end':
        mainPos += remainingSpace;
        break;
      case 'space-between':
        if (node.children.length > 1) {
          spacing = remainingSpace / (node.children.length - 1);
        }
        break;
      case 'space-around':
        spacing = remainingSpace / node.children.length;
        mainPos += spacing / 2;
        break;
      case 'space-evenly':
        spacing = remainingSpace / (node.children.length + 1);
        mainPos += spacing;
        break;
    }
    
    // Position each child
    for (const child of node.children) {
      // Main axis positioning
      if (isRow) {
        child.x = mainPos;
        mainPos += child.width + gap + spacing;
      } else {
        child.y = mainPos;
        mainPos += child.height + gap + spacing;
      }
      
      // Cross axis positioning based on align-items
      const crossSize = isRow ? contentBox.height : contentBox.width;
      const childCrossSize = isRow ? child.height : child.width;
      const crossPos = (contentBox.y || 0);
      
      switch (alignItems) {
        case 'center':
          if (isRow) {
            child.y = crossPos + (crossSize - childCrossSize) / 2;
          } else {
            child.x = crossPos + (crossSize - childCrossSize) / 2;
          }
          break;
        case 'flex-end':
          if (isRow) {
            child.y = crossPos + crossSize - childCrossSize;
          } else {
            child.x = crossPos + crossSize - childCrossSize;
          }
          break;
        case 'stretch':
          if (isRow && child.style.height === 'auto') {
            child.height = crossSize;
          } else if (!isRow && child.style.width === 'auto') {
            child.width = crossSize;
          }
          if (isRow) {
            child.y = crossPos;
          } else {
            child.x = crossPos;
          }
          break;
        default: // flex-start
          if (isRow) {
            child.y = crossPos;
          } else {
            child.x = crossPos;
          }
      }
      
      // Recursively calculate children
      this.calculate(child, child.width, child.height);
    }
  }
  
  /**
   * Get content box (inner dimensions after padding)
   */
  getContentBox(node) {
    const padding = this.normalizePadding(node.style.padding);
    
    return {
      x: padding.left,
      y: padding.top,
      width: Math.max(0, node.width - padding.left - padding.right),
      height: Math.max(0, node.height - padding.top - padding.bottom),
    };
  }
  
  /**
   * Get outer box (dimensions including margin)
   */
  getOuterBox(node) {
    const margin = this.normalizeMargin(node.style.margin);
    
    return {
      x: node.x - margin.left,
      y: node.y - margin.top,
      width: node.width + margin.left + margin.right,
      height: node.height + margin.top + margin.bottom,
    };
  }
  
  /**
   * Apply size constraints to a node
   */
  applyConstraints(node, parentWidth = null, parentHeight = null) {
    const style = node.style;
    
    // Handle percentage widths
    if (typeof style.width === 'string' && style.width.endsWith('%') && parentWidth) {
      const percent = parseFloat(style.width) / 100;
      node.width = parentWidth * percent;
    } else if (typeof style.width === 'number') {
      node.width = style.width;
    }
    
    if (typeof style.height === 'string' && style.height.endsWith('%') && parentHeight) {
      const percent = parseFloat(style.height) / 100;
      node.height = parentHeight * percent;
    } else if (typeof style.height === 'number') {
      node.height = style.height;
    }
    
    // Apply min/max constraints
    if (style.minWidth) {
      node.width = Math.max(node.width, style.minWidth);
    }
    if (style.maxWidth && style.maxWidth !== Infinity) {
      node.width = Math.min(node.width, style.maxWidth);
    }
    if (style.minHeight) {
      node.height = Math.max(node.height, style.minHeight);
    }
    if (style.maxHeight && style.maxHeight !== Infinity) {
      node.height = Math.min(node.height, style.maxHeight);
    }
  }
  
  /**
   * Normalize padding value to object
   */
  normalizePadding(padding) {
    if (typeof padding === 'number') {
      return { top: padding, right: padding, bottom: padding, left: padding };
    }
    if (typeof padding === 'object') {
      return {
        top: padding.top || 0,
        right: padding.right || 0,
        bottom: padding.bottom || 0,
        left: padding.left || 0,
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  /**
   * Normalize margin value to object
   */
  normalizeMargin(margin) {
    return this.normalizePadding(margin); // Same logic
  }
}

/**
 * Helper function to create a layout tree from component tree
 */
export function createLayoutTree(component) {
  const node = new LayoutNode(component.style || {});
  
  if (component.children) {
    const children = Array.isArray(component.children) 
      ? component.children 
      : [component.children];
    
    for (const child of children) {
      if (child) {
        node.appendChild(createLayoutTree(child));
      }
    }
  }
  
  return node;
}