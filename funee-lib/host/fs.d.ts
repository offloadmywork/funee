/**
 * Host Filesystem Module
 * 
 * Provides file system operations.
 * Import from "host://fs"
 */

/**
 * File/directory stats returned by lstat()
 */
export interface FileStats {
  /** Size in bytes */
  size: number;
  /** True if this is a regular file */
  is_file: boolean;
  /** True if this is a directory */
  is_directory: boolean;
  /** Last modification time as milliseconds since epoch */
  modified_ms: number;
}

/**
 * Options for mkdir()
 */
export interface MkdirOptions {
  /** Create parent directories if they don't exist */
  recursive?: boolean;
}

/**
 * Read a file as UTF-8 text
 */
export declare function readFile(path: string): Promise<string>;

/**
 * Read a file as binary data
 */
export declare function readFileBinary(path: string): Promise<Uint8Array>;

/**
 * Write text content to a file
 */
export declare function writeFile(path: string, content: string): Promise<void>;

/**
 * Write binary data to a file
 */
export declare function writeFileBinary(path: string, content: Uint8Array): Promise<void>;

/**
 * Check if path is a regular file
 */
export declare function isFile(path: string): Promise<boolean>;

/**
 * Check if path exists (file or directory)
 */
export declare function exists(path: string): Promise<boolean>;

/**
 * Get file/directory stats (does not follow symlinks)
 */
export declare function lstat(path: string): Promise<FileStats>;

/**
 * Create a directory
 */
export declare function mkdir(path: string, options?: MkdirOptions): Promise<void>;

/**
 * Read directory contents
 * @returns Array of entry names (not full paths)
 */
export declare function readdir(path: string): Promise<string[]>;

/**
 * Get the system temporary directory path
 */
export declare function tmpdir(): string;
