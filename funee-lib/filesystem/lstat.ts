/**
 * lstat - Get file stats without following symlinks
 */

import { lstat as hostLstat } from "host://fs";
import { PathString } from "./PathString.ts";
import { parseResult, unwrap, FsResult, FileStats } from "./FsResult.ts";

/**
 * Get file stats without following symlinks (returns result object).
 * 
 * Use this when you want to handle errors yourself instead of throwing.
 * 
 * @param path - Path to get stats for
 * @returns Result object with stats or error
 */
export const lstatRaw = (path: PathString): FsResult<FileStats> => {
  const json = hostLstat(path);
  return parseResult(json) as FsResult<FileStats>;
};

/**
 * Get file stats without following symlinks.
 * 
 * This is similar to Node.js fs.lstat - it does not follow symlinks,
 * so you can detect if a path is a symlink.
 * 
 * @param path - Path to get stats for
 * @returns File stats object
 * @throws Error if the path does not exist or cannot be accessed
 * 
 * @example
 * ```typescript
 * import { lstat } from "funee";
 * 
 * const stats = lstat("/path/to/file.txt");
 * log(`Size: ${stats.size} bytes`);
 * log(`Is file: ${stats.is_file}`);
 * log(`Is directory: ${stats.is_directory}`);
 * log(`Is symlink: ${stats.is_symlink}`);
 * ```
 */
export const lstat = (path: PathString): FileStats => {
  const result = lstatRaw(path);
  return unwrap(result);
};
