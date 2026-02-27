/**
 * Host Watch Module
 * 
 * Provides file system watching functionality.
 * Import from "host://watch"
 */

/**
 * Types of file system events
 */
export type WatchEventKind = "create" | "modify" | "remove" | "rename";

/**
 * A file system watch event
 */
export interface WatchEvent {
  /** Type of event that occurred */
  kind: WatchEventKind;
  /** Paths affected by this event */
  paths: string[];
}

/**
 * Options for watchDirectory
 */
export interface WatchDirectoryOptions {
  /** Watch subdirectories recursively */
  recursive?: boolean;
}

/**
 * Watch a single file for changes
 * 
 * @param path - Path to the file to watch
 * @returns AsyncIterable that yields watch events
 * 
 * @example
 * ```typescript
 * import { watchFile } from "host://watch";
 * 
 * for await (const event of watchFile("./config.json")) {
 *   console.log("Config changed:", event.kind);
 * }
 * ```
 */
export declare function watchFile(path: string): AsyncIterable<WatchEvent>;

/**
 * Watch a directory for changes
 * 
 * @param path - Path to the directory to watch
 * @param options - Watch options
 * @returns AsyncIterable that yields watch events
 * 
 * @example
 * ```typescript
 * import { watchDirectory } from "host://watch";
 * 
 * for await (const event of watchDirectory("./src", { recursive: true })) {
 *   console.log("File changed:", event.paths, event.kind);
 * }
 * ```
 */
export declare function watchDirectory(
  path: string,
  options?: WatchDirectoryOptions
): AsyncIterable<WatchEvent>;
