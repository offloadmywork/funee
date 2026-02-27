/**
 * Host Process Module
 * 
 * Provides subprocess spawning functionality.
 * Import from "host://process"
 */

/**
 * Signal types supported for process killing
 */
export type Signal =
  | "SIGTERM"
  | "SIGKILL"
  | "SIGINT"
  | "SIGHUP"
  | "SIGQUIT";

/**
 * Options for spawning a subprocess
 */
export interface SpawnOptions {
  /** Command and arguments as array */
  cmd: string[];

  /** Working directory for the process */
  cwd?: string;

  /** Environment variables (replaces or merges with process env) */
  env?: Record<string, string>;

  /** Inherit environment and merge with env option (default: true) */
  inheritEnv?: boolean;

  /** How to handle stdin: "piped" | "inherit" | "null" (default: "null") */
  stdin?: "piped" | "inherit" | "null";

  /** How to handle stdout: "piped" | "inherit" | "null" (default: "piped") */
  stdout?: "piped" | "inherit" | "null";

  /** How to handle stderr: "piped" | "inherit" | "null" (default: "piped") */
  stderr?: "piped" | "inherit" | "null";
}

/**
 * Process exit status
 */
export interface ProcessStatus {
  /** True if process exited with code 0 */
  success: boolean;

  /** Exit code (null if terminated by signal) */
  code: number | null;

  /** Signal that terminated the process (null if normal exit) */
  signal: Signal | null;
}

/**
 * Output from a completed process
 */
export interface CommandOutput {
  /** Process exit status */
  status: ProcessStatus;

  /** Stdout as Uint8Array (empty if stdout not piped) */
  stdout: Uint8Array;

  /** Stderr as Uint8Array (empty if stderr not piped) */
  stderr: Uint8Array;

  /** Convenience: stdout decoded as UTF-8 string */
  stdoutText(): string;

  /** Convenience: stderr decoded as UTF-8 string */
  stderrText(): string;
}

/**
 * Handle to a running subprocess
 */
export interface Process {
  /** Process ID (OS-level PID) */
  readonly pid: number;

  /** Promise that resolves with ProcessStatus when process exits */
  readonly status: Promise<ProcessStatus>;

  /** Send a signal to the process */
  kill(signal?: Signal): void;

  /** Wait for process and collect all output */
  output(): Promise<CommandOutput>;

  /** Write data to stdin and close it */
  writeInput(data: string | Uint8Array): Promise<void>;
}

/**
 * Spawn a subprocess and wait for completion (simple form)
 * 
 * @param command - Command to execute
 * @param args - Optional command arguments
 * @returns Promise resolving to CommandOutput when process exits
 * 
 * @example
 * ```typescript
 * import { spawn } from "host://process";
 * 
 * const result = await spawn("echo", ["hello"]);
 * console.log(result.stdoutText()); // "hello\n"
 * ```
 */
export declare function spawn(command: string, args?: string[]): Promise<CommandOutput>;

/**
 * Spawn a subprocess with full control (options form)
 * 
 * @param options - Spawn configuration
 * @returns Process handle for interacting with the running process
 * 
 * @example
 * ```typescript
 * import { spawn } from "host://process";
 * 
 * const proc = spawn({
 *   cmd: ["cat"],
 *   stdin: "piped",
 * });
 * await proc.writeInput("hello");
 * const output = await proc.output();
 * ```
 */
export declare function spawn(options: SpawnOptions): Process;
