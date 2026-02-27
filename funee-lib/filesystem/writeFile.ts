/**
 * writeFile - Write content to a file
 */

import { writeFile as hostWriteFile } from "host://fs";
import { FilePathString, PathString } from "./PathString.ts";
import { parseResult, unwrap, FsResult } from "./FsResult.ts";

/**
 * Write content to a file (returns result object).
 * 
 * Use this when you want to handle errors yourself instead of throwing.
 * 
 * @param path - Path to the file to write
 * @param content - Content to write
 * @returns Result object with null value or error
 */
export const writeFileRaw = (path: PathString, content: string): FsResult<null> => {
  const json = hostWriteFile(path, content);
  return parseResult(json) as FsResult<null>;
};

/**
 * Write content to a file.
 * 
 * @param path - Path to the file to write
 * @param content - Content to write
 * @throws Error if the file cannot be written
 * 
 * @example
 * ```typescript
 * import { writeFile } from "funee";
 * 
 * writeFile("/path/to/file.txt" as FilePathString, "Hello, world!");
 * ```
 */
export const writeFile = (path: FilePathString, content: string): void => {
  const result = writeFileRaw(path, content);
  unwrap(result);
};
