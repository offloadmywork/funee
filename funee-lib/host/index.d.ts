/**
 * Host Module Type Declarations
 * 
 * This file references all host module declarations for TypeScript.
 * These types describe the interfaces provided by funee's host runtime
 * via the host:// import scheme.
 * 
 * @example
 * ```typescript
 * import { readFile, writeFile } from "host://fs";
 * import { fetch } from "host://http";
 * import { serve } from "host://server";
 * import { spawn } from "host://process";
 * import { setTimeout } from "host://time";
 * import { watchFile } from "host://watch";
 * import { randomBytes } from "host://crypto";
 * import { log } from "host://console";
 * ```
 */

/// <reference path="./fs.d.ts" />
/// <reference path="./http.d.ts" />
/// <reference path="./server.d.ts" />
/// <reference path="./process.d.ts" />
/// <reference path="./time.d.ts" />
/// <reference path="./watch.d.ts" />
/// <reference path="./crypto.d.ts" />
/// <reference path="./console.d.ts" />

// Re-export all types for convenience
export * from "./fs.d.ts";
export * from "./http.d.ts";
export * from "./server.d.ts";
export * from "./process.d.ts";
export * from "./time.d.ts";
export * from "./watch.d.ts";
export * from "./crypto.d.ts";
export * from "./console.d.ts";
