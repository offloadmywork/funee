/**
 * Host Watch Module
 * 
 * Provides file system watching functionality.
 * Import from "host://watch"
 */

/**
 * Start watching a path for changes
 * 
 * @param path - Path to watch
 * @param recursive - Whether to watch subdirectories
 * @returns JSON string with watcher ID or error
 * 
 * @example
 * ```typescript
 * import { watchStart, watchPoll, watchStop } from "host://watch";
 * 
 * const result = JSON.parse(watchStart("./src", true));
 * const watcherId = result.value;
 * 
 * // Poll for events
 * const events = JSON.parse(watchPoll(watcherId));
 * 
 * // Stop watching
 * watchStop(watcherId);
 * ```
 */
export declare function watchStart(path: string, recursive: boolean): string;

/**
 * Poll for watch events from a watcher
 * 
 * @param watcherId - The watcher ID from watchStart
 * @returns JSON string with array of events, or "null" if no events
 */
export declare function watchPoll(watcherId: number): string;

/**
 * Stop a watcher
 * 
 * @param watcherId - The watcher ID from watchStart
 */
export declare function watchStop(watcherId: number): void;
