/**
 * ANSI escape sequence utilities for terminal manipulation
 */

// Cursor movement
export const moveCursor = (x, y) => `\x1b[${y + 1};${x + 1}H`;
export const moveCursorUp = (n = 1) => `\x1b[${n}A`;
export const moveCursorDown = (n = 1) => `\x1b[${n}B`;
export const moveCursorRight = (n = 1) => `\x1b[${n}C`;
export const moveCursorLeft = (n = 1) => `\x1b[${n}D`;

// Cursor visibility
export const hideCursor = () => '\x1b[?25l';
export const showCursor = () => '\x1b[?25h';

// Screen clearing
export const clearScreen = () => '\x1b[2J';
export const clearLine = () => '\x1b[2K';
export const clearToEndOfLine = () => '\x1b[K';
export const clearToEndOfScreen = () => '\x1b[J';

// Text styling
export const style = {
  // Reset
  reset: '\x1b[0m',
  
  // Font styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  strikethrough: '\x1b[9m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright foreground colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgGray: '\x1b[100m',
  
  // Bright background colors
  bgBrightRed: '\x1b[101m',
  bgBrightGreen: '\x1b[102m',
  bgBrightYellow: '\x1b[103m',
  bgBrightBlue: '\x1b[104m',
  bgBrightMagenta: '\x1b[105m',
  bgBrightCyan: '\x1b[106m',
  bgBrightWhite: '\x1b[107m',
};

/**
 * Apply styles to text
 */
export const applyStyle = (text, ...styles) => {
  const styleSequence = styles
    .map((s) => (typeof s === 'string' ? s : style[s] || ''))
    .join('');
  
  return `${styleSequence}${text}${style.reset}`;
};

/**
 * Create RGB color (256 color mode)
 */
export const rgb = (r, g, b, background = false) => {
  // Convert RGB to 256 color palette
  const value = 16 + 36 * Math.round(r / 51) + 6 * Math.round(g / 51) + Math.round(b / 51);
  
  return background ? `\x1b[48;5;${value}m` : `\x1b[38;5;${value}m`;
};

/**
 * Create true color (24-bit RGB)
 */
export const trueColor = (r, g, b, background = false) => 
  background 
    ? `\x1b[48;2;${r};${g};${b}m`
    : `\x1b[38;2;${r};${g};${b}m`;

/**
 * Box drawing characters
 */
export const box = {
  // Single line
  single: {
    horizontal: '─',
    vertical: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    cross: '┼',
    teeUp: '┴',
    teeDown: '┬',
    teeLeft: '┤',
    teeRight: '├',
  },
  
  // Double line
  double: {
    horizontal: '═',
    vertical: '║',
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    cross: '╬',
    teeUp: '╩',
    teeDown: '╦',
    teeLeft: '╣',
    teeRight: '╠',
  },
  
  // Rounded corners
  rounded: {
    horizontal: '─',
    vertical: '│',
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
  },
  
  // Heavy/thick lines
  heavy: {
    horizontal: '━',
    vertical: '┃',
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    cross: '╋',
    teeUp: '┻',
    teeDown: '┳',
    teeLeft: '┫',
    teeRight: '┣',
  },
};

/**
 * Draw a box with specified style
 */
export const drawBox = (width, height, boxStyle = 'single') => {
  const chars = box[boxStyle] || box.single;
  const lines = [];
  
  // Top border
  lines.push(
    chars.topLeft + 
    chars.horizontal.repeat(width - 2) + 
    chars.topRight
  );
  
  // Middle lines
  for (let i = 0; i < height - 2; i++) {
    lines.push(
      chars.vertical + 
      ' '.repeat(width - 2) + 
      chars.vertical
    );
  }
  
  // Bottom border
  lines.push(
    chars.bottomLeft + 
    chars.horizontal.repeat(width - 2) + 
    chars.bottomRight
  );
  
  return lines;
};

/**
 * Measure text width (accounting for ANSI codes)
 */
export const measureText = (text) => {
  // Remove ANSI escape sequences
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  
  return stripped.length;
};

/**
 * Truncate text to specified width
 */
export const truncateText = (text, width, ellipsis = '...') => {
  const textWidth = measureText(text);
  
  if (textWidth <= width) {
    return text;
  }
  
  // Strip ANSI codes for truncation
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const truncated = stripped.slice(0, width - ellipsis.length) + ellipsis;
  
  return truncated;
};

/**
 * Pad text to specified width
 */
export const padText = (text, width, align = 'left', fillChar = ' ') => {
  const textWidth = measureText(text);
  
  if (textWidth >= width) {
    return truncateText(text, width);
  }
  
  const padding = width - textWidth;
  
  switch (align) {
    case 'center': {
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      
      return fillChar.repeat(leftPad) + text + fillChar.repeat(rightPad);
    }
    case 'right':
      return fillChar.repeat(padding) + text;
    default: // left
      return text + fillChar.repeat(padding);
  }
};

/**
 * Create a progress bar
 */
export const progressBar = (value, max, width = 20, filled = '█', empty = '░') => {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const filledWidth = Math.round(percentage * width);
  const emptyWidth = width - filledWidth;
  
  return filled.repeat(filledWidth) + empty.repeat(emptyWidth);
};

/**
 * Terminal bell/beep
 */
export const bell = () => '\x07';

/**
 * Save and restore cursor position
 */
export const saveCursor = () => '\x1b7';
export const restoreCursor = () => '\x1b8';

/**
 * Set terminal title
 */
export const setTitle = (title) => `\x1b]0;${title}\x07`;