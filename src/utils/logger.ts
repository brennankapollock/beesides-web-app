/**
 * Logger utility for consistent, formatted logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogCategory = 'auth' | 'api' | 'navigation' | 'user' | 'system';

interface LogOptions {
  category: LogCategory;
  data?: Record<string, any>;
  timestamp?: boolean;
}

/**
 * Formats log data as a string with proper indentation
 */
const formatData = (data: Record<string, any>): string => {
  try {
    return JSON.stringify(data, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : `    ${line}`))
      .join('\n');
  } catch (e) {
    return '[Unserializable data]';
  }
};

/**
 * Creates a styled console log with consistent formatting
 */
const log = (level: LogLevel, message: string, options: LogOptions) => {
  const { category, data, timestamp = true } = options;
  
  // Create timestamp
  const time = timestamp ? `[${new Date().toISOString()}]` : '';
  
  // Create category tag with color
  const categoryColors: Record<LogCategory, string> = {
    auth: '#4CAF50',     // Green
    api: '#2196F3',      // Blue
    navigation: '#FF9800', // Orange
    user: '#9C27B0',     // Purple
    system: '#607D8B'    // Gray
  };
  
  const categoryTag = `%c[${category.toUpperCase()}]%c`;
  const categoryStyle = `background: ${categoryColors[category]}; color: white; padding: 2px 4px; border-radius: 2px; font-weight: bold;`;
  const resetStyle = '';
  
  // Log level emoji
  const levelEmoji = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '🔴',
    debug: '🔍'
  };
  
  // Build the log message
  const logParts = [
    `${levelEmoji[level]} ${categoryTag} ${time} ${message}`,
    categoryStyle,
    resetStyle
  ];
  
  // Add data if provided
  if (data && Object.keys(data).length > 0) {
    console.groupCollapsed(...logParts);
    console.log(formatData(data));
    console.groupEnd();
  } else {
    console.log(...logParts);
  }
};

export const logger = {
  info: (message: string, options: LogOptions) => log('info', message, options),
  warn: (message: string, options: LogOptions) => log('warn', message, options),
  error: (message: string, options: LogOptions) => log('error', message, options),
  debug: (message: string, options: LogOptions) => log('debug', message, options),
};
