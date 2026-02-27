/**
 * Subprocess API for funee
 * 
 * Provides spawn() for running and managing child processes.
 * The actual implementation is provided by the runtime bootstrap.
 * 
 * @example
 * ```typescript
 * import { spawn } from "funee";
 * 
 * // Simple usage - returns Promise<CommandOutput>
 * const result = await spawn("echo", ["hello world"]);
 * console.log(result.stdoutText()); // "hello world\n"
 * console.log(result.status.code);  // 0
 * 
 * // With options - returns Process handle
 * const proc = spawn({
 *   cmd: ["cat"],
 *   stdin: "piped",
 *   stdout: "piped",
 * });
 * await proc.writeInput("hello");
 * const output = await proc.output();
 * console.log(output.stdoutText());  // "hello"
 * ```
 */

import { spawn as hostSpawn } from "host://process";
import type { SpawnOptions, ProcessStatus, CommandOutput, Process, Signal } from "./types.ts";

// Re-export types
export type { SpawnOptions, ProcessStatus, CommandOutput, Process, Signal } from "./types.ts";

/**
 * Spawn a subprocess.
 * 
 * Two calling styles supported:
 * 
 * 1. Simple form - runs command and waits for output:
 *    `const result = await spawn("echo", ["hello"]);`
 *    Returns: Promise<CommandOutput>
 * 
 * 2. Options form - returns Process handle for streaming:
 *    `const proc = spawn({ cmd: ["cat"], stdin: "piped" });`
 *    Returns: Process
 * 
 * @example
 * ```typescript
 * // Simple: capture output
 * const result = await spawn("ls", ["-la"]);
 * console.log(result.stdoutText());
 * console.log("Exit code:", result.status.code);
 * 
 * // Advanced: streaming with stdin
 * const proc = spawn({
 *   cmd: ["grep", "ERROR"],
 *   stdin: "piped",
 *   stdout: "piped",
 * });
 * await proc.writeInput("ERROR: something bad\nINFO: ok\n");
 * const filtered = await proc.output();
 * console.log(filtered.stdoutText());  // "ERROR: something bad\n"
 * ```
 */
export const spawn = hostSpawn;
