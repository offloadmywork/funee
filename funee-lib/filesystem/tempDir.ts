/**
 * Disposable Temporary Directory
 * 
 * Creates a temporary directory that is automatically deleted when disposed.
 * Uses Symbol.asyncDispose for `await using` syntax support.
 * 
 * @example
 * ```typescript
 * import { tempDir } from "funee";
 * 
 * // Automatically deleted when scope ends
 * await using tmp = tempDir();
 * console.log(tmp.path);  // "/tmp/funee_a1b2c3d4e5f6"
 * 
 * // Write files, do work...
 * // Directory is deleted automatically when `tmp` goes out of scope
 * ```
 */

import { mkdir } from "host://fs";
import { spawn } from "host://process";
import { someDirectory } from "../abstracts/index.ts";
import type { FolderPathString } from "./PathString.ts";

/**
 * A temporary directory handle with async disposal support.
 */
export type TempDir = {
  /** The absolute path to the temporary directory */
  readonly path: FolderPathString;
  /** Async disposable - deletes the directory when disposed */
  [Symbol.asyncDispose]: () => Promise<void>;
};

/**
 * Create a disposable temporary directory.
 * 
 * The directory is created immediately and will be deleted (with all contents)
 * when the returned handle is disposed using `await using`.
 * 
 * @returns A TempDir handle with the path and async disposal
 * 
 * @example
 * ```typescript
 * // Basic usage with await using
 * await using tmp = tempDir();
 * writeFile(`${tmp.path}/test.txt`, "hello");
 * // Directory deleted automatically
 * 
 * // Manual disposal
 * const tmp = tempDir();
 * try {
 *   // use tmp.path
 * } finally {
 *   await tmp[Symbol.asyncDispose]();
 * }
 * ```
 */
export const tempDir = (): TempDir => {
  const path = someDirectory();
  
  // Create the directory
  mkdir(path);
  
  return {
    get path() {
      return path;
    },
    [Symbol.asyncDispose]: async () => {
      // Use spawn to run rm -rf for reliable recursive deletion
      const result = await spawn("rm", ["-rf", path]);
      if (result.status.code !== 0) {
        throw new Error(`Failed to delete temp directory ${path}: exit code ${result.status.code}`);
      }
    },
  };
};
