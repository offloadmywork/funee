/**
 * Write binary data (Uint8Array) to a file
 */

import { writeFileBinary as hostWriteFileBinary } from "host://fs";
import type { FilePathString, FsResult } from "./index.ts";
import { parseResult, unwrap } from "./FsResult.ts";
import { base64Encode } from "./readFileBinary.ts";

/**
 * Write binary data to a file (raw result with error handling)
 * 
 * @example
 * ```typescript
 * const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
 * const result = writeFileBinaryRaw("/path/to/file.bin" as FilePathString, data);
 * if (result.type === "error") {
 *   console.error(result.error);
 * }
 * ```
 */
export const writeFileBinaryRaw = (path: FilePathString, data: Uint8Array): FsResult<void> => {
  const base64 = base64Encode(data);
  const json = hostWriteFileBinary(path, base64);
  return parseResult<void>(json);
};

/**
 * Write binary data to a file (throws on error)
 * 
 * @example
 * ```typescript
 * const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
 * writeFileBinary("/path/to/file.bin" as FilePathString, data);
 * ```
 */
export const writeFileBinary = (path: FilePathString, data: Uint8Array): void => {
  unwrap(writeFileBinaryRaw(path, data));
};
