/**
 * Watcher utilities for funee
 * 
 * Provides file system watching via async iterables.
 * Uses the notify crate on the Rust side for cross-platform support.
 */

import { watchStart, watchPoll, watchStop } from "host://watch";

/**
 * Event kinds emitted by watchers
 */
export type WatchEventKind = "create" | "modify" | "remove" | "access" | "other" | "any";

/**
 * File system watch event
 */
export type WatchEvent = {
  kind: WatchEventKind;
  path: string;
};

/**
 * Options for directory watching
 */
export type WatchOptions = {
  recursive?: boolean;
};

/**
 * Result type from watcher ops
 */
type WatchResult = { type: "ok"; value: number } | { type: "error"; error: string };

/**
 * Parse the result from watchStart
 */
const parseWatchResult = (json: string): number => {
  const result = JSON.parse(json) as WatchResult;
  if (result.type === "error") {
    throw new Error(result.error);
  }
  return result.value;
};

/**
 * Poll interval in milliseconds
 */
const POLL_INTERVAL_MS = 50;

/**
 * Async iterable watcher type
 */
export type Watcher = AsyncIterable<WatchEvent> & {
  stop: () => void;
};

/**
 * Creates an async iterable that yields events for all filesystem changes.
 * Internal implementation shared by watchFile and watchDirectory.
 */
const createWatcher = (path: string, recursive: boolean): Watcher => {
  const watcherId = parseWatchResult(watchStart(path, recursive));
  let stopped = false;

  const iterable: Watcher = {
    [Symbol.asyncIterator]: async function* () {
      while (!stopped) {
        const eventsJson = watchPoll(watcherId);
        if (eventsJson !== "null") {
          const events = JSON.parse(eventsJson) as WatchEvent[];
          for (const event of events) {
            yield event;
          }
        }
        // Small delay to avoid busy-waiting
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    },
    stop: () => {
      if (!stopped) {
        stopped = true;
        watchStop(watcherId);
      }
    },
  };

  return iterable;
};

/**
 * Watch a file for changes
 * 
 * Returns an async iterable that yields events when the file is modified,
 * created, deleted, or renamed.
 * 
 * @example
 * ```typescript
 * import { watchFile, log } from "funee";
 * 
 * const watcher = watchFile("./config.json");
 * 
 * for await (const event of watcher) {
 *   log(`File ${event.kind}: ${event.path}`);
 *   if (shouldStop) {
 *     watcher.stop();
 *   }
 * }
 * ```
 */
export const watchFile = (path: string): Watcher => {
  return createWatcher(path, false);
};

/**
 * Watch a directory for changes
 * 
 * Returns an async iterable that yields events for all files and
 * subdirectories. Set options.recursive to watch nested directories.
 * 
 * @example
 * ```typescript
 * import { watchDirectory, log } from "funee";
 * 
 * const watcher = watchDirectory("./src", { recursive: true });
 * 
 * for await (const event of watcher) {
 *   log(`${event.kind}: ${event.path}`);
 * }
 * ```
 */
export const watchDirectory = (path: string, options?: WatchOptions): Watcher => {
  const recursive = options?.recursive ?? false;
  return createWatcher(path, recursive);
};
