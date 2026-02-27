/**
 * readFile - Read file contents as a string
 */

import { readFile as hostReadFile } from "host://fs";
import { FilePathString, PathString } from "./PathString.ts";
import { parseResult, unwrap, FsResult } from "./FsResult.ts";

/**
 * Read the contents of a file as a UTF-8 string (returns result object).
 * 
 * Use this when you want to handle errors yourself instead of throwing.
 * 
 * @param path - Path to the file to read
 * @returns Result object with value or error
 */
export const readFileRaw = (path: PathString): FsResult<string> => {
  const json = hostReadFile(path);
  return parseResult(json) as FsResult<string>;
};

/**
 * Read the contents of a file as a UTF-8 string.
 * 
 * @param path - Path to the file to read
 * @returns The file contents as a string
 * @throws Error if the file cannot be read
 * 
 * @example
 * ```typescript
 * import { readFile } from "funee";
 * 
 * const content = readFile("/path/to/file.txt" as FilePathString);
 * log(content);
 * ```
 */
export const readFile = (path: FilePathString): string => {
  const result = readFileRaw(path);
  return unwrap(result);
};
