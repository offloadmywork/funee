/**
 * isFile - Check if a path is a file
 */

import { isFile as hostIsFile } from "host://fs";
import { PathString } from "./PathString.ts";

/**
 * Check if a path points to a file (not a directory or symlink).
 * 
 * @param path - Path to check
 * @returns true if path is a file, false otherwise
 * 
 * @example
 * ```typescript
 * import { isFile } from "funee";
 * 
 * if (isFile("/path/to/something")) {
 *   log("It's a file!");
 * }
 * ```
 */
export const isFile = (path: PathString): boolean => {
  return hostIsFile(path);
};
