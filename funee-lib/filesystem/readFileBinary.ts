/**
 * Read a file as binary data (Uint8Array)
 */

import { readFileBinary as hostReadFileBinary } from "host://fs";
import type { FilePathString, FsResult } from "./index.ts";
import { parseResult, unwrap } from "./FsResult.ts";

// Base64 character set
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Base64 encoding utility
 */
export const base64Encode = (bytes: Uint8Array): string => {
  let result = "";
  const len = bytes.length;
  
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;
    
    result += BASE64_CHARS[b1 >> 2];
    result += BASE64_CHARS[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < len ? BASE64_CHARS[((b2 & 15) << 2) | (b3 >> 6)] : "=";
    result += i + 2 < len ? BASE64_CHARS[b3 & 63] : "=";
  }
  
  return result;
};

/**
 * Base64 decoding utility
 */
export const base64Decode = (base64: string): Uint8Array => {
  const lookup = new Uint8Array(256);
  for (let i = 0; i < BASE64_CHARS.length; i++) {
    lookup[BASE64_CHARS.charCodeAt(i)] = i;
  }

  // Remove padding
  let len = base64.length;
  if (base64[len - 1] === "=") len--;
  if (base64[len - 1] === "=") len--;

  const bytes = new Uint8Array((len * 3) / 4);
  let p = 0;

  for (let i = 0; i < len; ) {
    const c1 = lookup[base64.charCodeAt(i++)];
    const c2 = lookup[base64.charCodeAt(i++)];
    const c3 = lookup[base64.charCodeAt(i++)];
    const c4 = lookup[base64.charCodeAt(i++)];

    bytes[p++] = (c1 << 2) | (c2 >> 4);
    if (i - 1 < len) bytes[p++] = ((c2 & 15) << 4) | (c3 >> 2);
    if (i < len) bytes[p++] = ((c3 & 3) << 6) | c4;
  }

  return bytes.slice(0, p);
};

/**
 * Read file contents as binary data (raw result with error handling)
 * 
 * @example
 * ```typescript
 * const result = readFileBinaryRaw("/path/to/file.bin" as FilePathString);
 * if (result.type === "ok") {
 *   console.log(result.value.length);
 * }
 * ```
 */
export const readFileBinaryRaw = (path: FilePathString): FsResult<Uint8Array> => {
  const json = hostReadFileBinary(path);
  const result = parseResult<string>(json);
  if (result.type === "ok") {
    return { type: "ok", value: base64Decode(result.value) };
  }
  return result;
};

/**
 * Read file contents as binary data (throws on error)
 * 
 * @example
 * ```typescript
 * const data = readFileBinary("/path/to/file.bin" as FilePathString);
 * console.log(data.length);
 * ```
 */
export const readFileBinary = (path: FilePathString): Uint8Array => {
  return unwrap(readFileBinaryRaw(path));
};
