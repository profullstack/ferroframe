/**
 * Component Styles - Predefined style utilities and themes
 */

import { ansi } from '@ferroframe/core';

// Color themes
export const themes = {
  default: {
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    danger: 'red',
    warning: 'yellow',
    info: 'cyan',
    light: 'white',
    dark: 'black',
  },
  dark: {
    primary: 'brightBlue',
    secondary: 'gray',
    success: 'brightGreen',
    danger: 'brightRed',
    warning: 'brightYellow',
    info: 'brightCyan',
    light: 'brightWhite',
    dark: 'black',
  },
};

// Common style presets
export const presets = {
  // Text styles
  heading1: {
    bold: true,
    underline: true,
    color: 'white',
  },
  heading2: {
    bold: true,
    color: 'cyan',
  },
  heading3: {
    bold: true,
    color: 'white',
  },
  label: {
    color: 'gray',
  },
  error: {
    color: 'red',
    bold: true,
  },
  success: {
    color: 'green',
  },
  warning: {
    color: 'yellow',
  },
  info: {
    color: 'cyan',
  },
  muted: {
    dim: true,
  },
  
  // Box styles
  panel: {
    border: 'single',
    padding: 10,
  },
  card: {
    border: 'rounded',
    padding: { top: 5, right: 10, bottom: 5, left: 10 },
    margin: 5,
  },
  modal: {
    border: 'double',
    padding: 10,
    margin: 'auto',
  },
  
  // Layout styles
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  
  // Input styles
  inputDefault: {
    width: 30,
  },
  inputFocused: {
    borderColor: 'cyan',
  },
  inputError: {
    borderColor: 'red',
  },
  
  // Button styles
  buttonPrimary: {
    variant: 'primary',
  },
  buttonSecondary: {
    variant: 'secondary',
  },
  buttonDanger: {
    variant: 'danger',
  },
  buttonSuccess: {
    variant: 'success',
  },
};

// Style helper functions
export function mergeStyles(...styles) {
  return Object.assign({}, ...styles);
}

export function applyTheme(component, theme = 'default') {
  const themeColors = themes[theme] || themes.default;
  
  // Apply theme colors to component
  if (component.style) {
    if (component.style.color && themeColors[component.style.color]) {
      component.style.color = themeColors[component.style.color];
    }
    if (component.style.borderColor && themeColors[component.style.borderColor]) {
      component.style.borderColor = themeColors[component.style.borderColor];
    }
  }
  
  return component;
}

// Spacing utilities
export const spacing = {
  none: 0,
  xs: 2,
  sm: 5,
  md: 10,
  lg: 15,
  xl: 20,
  xxl: 30,
};

// Border styles
export const borders = {
  none: null,
  single: 'single',
  double: 'double',
  rounded: 'rounded',
  heavy: 'heavy',
};

// Export default styles object
export default {
  themes,
  presets,
  spacing,
  borders,
  mergeStyles,
  applyTheme,
};