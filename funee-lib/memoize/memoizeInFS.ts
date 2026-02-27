import { readFile as hostReadFile, writeFile as hostWriteFile, exists as hostExists, mkdir as hostMkdir } from "host://fs";
import { parseResult, unwrap, FsResult } from "../filesystem/FsResult.ts";

/**
 * Memoize a function with filesystem-based caching.
 * 
 * Results are stored in `./cache/{identifier}_{args_hash}` files.
 * The cache persists across process restarts.
 * 
 * @param identifier - A unique identifier for this cache (identifies the function)
 * @param fn - The function to memoize
 * @returns A memoized version of the function that caches results to disk
 * 
 * @example
 * ```typescript
 * import { memoizeInFS } from "funee";
 * 
 * const expensiveComputation = memoizeInFS("myComputation", (x: number) => {
 *   // ... expensive work
 *   return result;
 * });
 * 
 * expensiveComputation(5); // computed and cached
 * expensiveComputation(5); // loaded from cache
 * ```
 */
export const memoizeInFS = <T extends (...args: any[]) => any>(
  identifier: string,
  fn: T
): ((...args: Parameters<T>) => Promise<ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>>) => {
  // In-memory cache to prevent concurrent calls
  const inProgress: Record<string, Promise<any>> = {};
  
  return (...args: Parameters<T>): Promise<ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>> => {
    // Create a hash from identifier and arguments
    const hash = identifier + "_" + args
      .map((x) => String(x))
      .join("_")
      .replace(/\//g, "_");
    
    const cachePath = `./cache/${hash}`;
    
    if (!inProgress[hash]) {
      inProgress[hash] = (async () => {
        // Ensure cache directory exists
        if (!hostExists("./cache")) {
          hostMkdir("./cache");
        }
        
        // Check for cached result
        if (hostExists(cachePath)) {
          const readResult = parseResult(hostReadFile(cachePath)) as FsResult<string>;
          if (readResult.type === "ok") {
            const cachedValue = readResult.value;
            if (cachedValue === "undefined") {
              return undefined;
            }
            return JSON.parse(cachedValue);
          }
        }
        
        // Compute result
        const result = await fn(...args);
        delete inProgress[hash];
        
        // Write to cache
        const toCache = result === undefined ? "undefined" : JSON.stringify(result);
        const writeResult = parseResult(hostWriteFile(cachePath, toCache));
        if (writeResult.type === "error") {
          throw new Error(`Failed to write cache: ${writeResult.error}`);
        }
        
        return result;
      })();
    }
    
    return inProgress[hash];
  };
};
