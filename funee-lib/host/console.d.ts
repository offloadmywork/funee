/**
 * Host Console Module
 * 
 * Provides console output functions.
 * Import from "host://console"
 */

/**
 * Log a message to stdout
 * 
 * @param args - Values to log (will be joined with spaces)
 * 
 * @example
 * ```typescript
 * import { log } from "host://console";
 * 
 * log("Hello", "world", 42); // "Hello world 42"
 * ```
 */
export declare function log(...args: unknown[]): void;

/**
 * Log a debug message
 * 
 * Debug messages may be filtered or formatted differently
 * depending on the runtime configuration.
 * 
 * @param args - Values to log (will be joined with spaces)
 */
export declare function debug(...args: unknown[]): void;
