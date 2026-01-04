/**
 * LOGGER UTILITY
 *
 * Environment-aware logging utility.
 * Disables verbose logging in production to keep console clean.
 *
 * Usage:
 * ```typescript
 * import { logger } from '@trainsmart/shared';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.warn('API rate limit approaching');
 * logger.error('Failed to save', error);
 * logger.debug('Detailed state:', state); // Only in development
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Prefix for all log messages */
  prefix?: string;
  /** Enable timestamps in log output */
  timestamps?: boolean;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Detect environment
const isProduction = typeof process !== 'undefined'
  ? process.env.NODE_ENV === 'production'
  : typeof window !== 'undefined' && window.location?.hostname !== 'localhost';

const isDevelopment = !isProduction;

// Default config based on environment
const defaultConfig: LoggerConfig = {
  minLevel: isProduction ? 'warn' : 'debug',
  prefix: '[TrainSmart]',
  timestamps: isDevelopment,
};

let currentConfig = { ...defaultConfig };

/**
 * Configure the logger
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Reset logger to default configuration
 */
export function resetLogger(): void {
  currentConfig = { ...defaultConfig };
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentConfig.minLevel];
}

function formatMessage(level: LogLevel, message: string): string {
  const parts: string[] = [];

  if (currentConfig.timestamps) {
    parts.push(`[${new Date().toISOString()}]`);
  }

  if (currentConfig.prefix) {
    parts.push(currentConfig.prefix);
  }

  parts.push(`[${level.toUpperCase()}]`);
  parts.push(message);

  return parts.join(' ');
}

/**
 * Main logger object with level-specific methods
 */
export const logger = {
  /**
   * Debug level - detailed information for debugging.
   * Only shown in development.
   */
  debug(message: string, ...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message), ...args);
    }
  },

  /**
   * Info level - general information about app flow.
   * Shown in development, hidden in production by default.
   */
  info(message: string, ...args: unknown[]): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message), ...args);
    }
  },

  /**
   * Warn level - potential issues that don't break functionality.
   * Always shown.
   */
  warn(message: string, ...args: unknown[]): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },

  /**
   * Error level - errors that affect functionality.
   * Always shown.
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (shouldLog('error')) {
      if (error instanceof Error) {
        console.error(formatMessage('error', message), error.message, error.stack, ...args);
      } else if (error !== undefined) {
        console.error(formatMessage('error', message), error, ...args);
      } else {
        console.error(formatMessage('error', message), ...args);
      }
    }
  },

  /**
   * Group related logs together (development only)
   */
  group(label: string): void {
    if (isDevelopment && shouldLog('debug')) {
      console.group(formatMessage('debug', label));
    }
  },

  /**
   * End a log group
   */
  groupEnd(): void {
    if (isDevelopment && shouldLog('debug')) {
      console.groupEnd();
    }
  },

  /**
   * Log with timing information
   */
  time(label: string): void {
    if (isDevelopment && shouldLog('debug')) {
      console.time(`${currentConfig.prefix} ${label}`);
    }
  },

  /**
   * End timing and log duration
   */
  timeEnd(label: string): void {
    if (isDevelopment && shouldLog('debug')) {
      console.timeEnd(`${currentConfig.prefix} ${label}`);
    }
  },

  /**
   * Log a table (development only)
   */
  table(data: unknown): void {
    if (isDevelopment && shouldLog('debug')) {
      console.table(data);
    }
  },

  /**
   * Check if we're in production mode
   */
  isProduction(): boolean {
    return isProduction;
  },

  /**
   * Check if we're in development mode
   */
  isDevelopment(): boolean {
    return isDevelopment;
  },
};

// Re-export types
export type { LogLevel, LoggerConfig };
