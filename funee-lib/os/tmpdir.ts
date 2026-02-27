import { tmpdir as hostTmpdir } from "host://fs";
import type { AbsolutePathString } from "../filesystem/index.ts";

/**
 * Get the system's temporary directory path.
 * 
 * @returns The absolute path to the system's temp directory
 * 
 * @example
 * ```typescript
 * import { tmpdir } from "funee";
 * 
 * const temp = tmpdir();
 * // => "/tmp" on Linux/macOS, or "C:\\Users\\...\\AppData\\Local\\Temp" on Windows
 * ```
 */
export const tmpdir = (): AbsolutePathString => {
  return hostTmpdir() as AbsolutePathString;
};
