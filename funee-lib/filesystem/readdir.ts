/**
 * readdir - List directory contents
 */

import { readdir as hostReaddir } from "host://fs";
import { FolderPathString, PathString, RelativePathString } from "./PathString.ts";
import { parseResult, unwrap, FsResult } from "./FsResult.ts";

/**
 * List directory contents (returns result object).
 * 
 * Use this when you want to handle errors yourself instead of throwing.
 * 
 * @param path - Path to the directory
 * @returns Result object with array of filenames or error
 */
export const readdirRaw = (path: PathString): FsResult<string[]> => {
  const json = hostReaddir(path);
  return parseResult(json) as FsResult<string[]>;
};

/**
 * List directory contents.
 * 
 * Returns an array of filenames (not full paths) in the directory.
 * 
 * @param path - Path to the directory
 * @returns Array of filenames in the directory
 * @throws Error if the directory does not exist or cannot be read
 * 
 * @example
 * ```typescript
 * import { readdir, log } from "funee";
 * 
 * const files = readdir("/home/user" as FolderPathString);
 * for (const file of files) {
 *   log(file);
 * }
 * ```
 */
export const readdir = (path: FolderPathString): RelativePathString[] => {
  const result = readdirRaw(path);
  return unwrap(result) as RelativePathString[];
};
