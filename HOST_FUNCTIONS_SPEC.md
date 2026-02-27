# Host Functions Implementation Spec

## Overview

This document specifies exactly how `host://` imports are resolved and implemented.

## URL Resolution

### Scheme Detection

In `load_module.rs`, when resolving an import:

```rust
fn resolve_import(specifier: &str, referrer: &str) -> Result<String> {
    if specifier.starts_with("host://") {
        // Return as-is, handled specially
        return Ok(specifier.to_string());
    }
    // ... existing resolution logic
}
```

### Host Module Mapping

The bundler maps `host://` URLs to internal module definitions:

| Import | Internal Module |
|--------|-----------------|
| `host://fs` | `[host:fs]` |
| `host://http` | `[host:http]` |
| `host://http/server` | `[host:http/server]` |
| `host://process` | `[host:process]` |
| `host://time` | `[host:time]` |
| `host://watch` | `[host:watch]` |
| `host://crypto` | `[host:crypto]` |
| `host://console` | `[host:console]` |

### Module Loading

Host modules are not loaded from disk or HTTP. Instead, the bundler generates synthetic modules that reference the runtime bootstrap.

```rust
// In load_module.rs
fn load_module(uri: &str) -> Result<ModuleSource> {
    if uri.starts_with("host://") {
        return Ok(generate_host_module(uri));
    }
    // ... existing loading logic
}

fn generate_host_module(uri: &str) -> ModuleSource {
    let namespace = uri.strip_prefix("host://").unwrap();
    // Return a synthetic module that re-exports from runtime
    ModuleSource {
        uri: uri.to_string(),
        content: format!("export * from '[runtime:{}]';", namespace),
    }
}
```

## Runtime Bootstrap Changes

### Current Bootstrap Structure

```javascript
// run_js.rs bootstrap
globalThis.log = (...args) => Deno.core.ops.op_log(args.join(" "));
globalThis.fetch = async (url, init) => { ... };
globalThis.setTimeout = (fn, ms) => { ... };
// etc.
```

### New Bootstrap Structure

Create namespaced exports that the generated host modules can reference:

```javascript
// Runtime modules (injected as [runtime:X])
const hostFs = {
  readFile: async (path) => Deno.core.ops.op_fsReadFile(path),
  writeFile: async (path, content) => Deno.core.ops.op_fsWriteFile(path, content),
  // ...
};

const hostHttp = {
  fetch: async (url, init) => { /* existing fetch impl */ },
};

const hostHttpServer = {
  serve: (options) => { /* existing serve impl */ },
};

const hostProcess = {
  spawn: (cmdOrOptions, args) => { /* existing spawn impl */ },
};

const hostTime = {
  setTimeout: (fn, ms) => { /* existing impl */ },
  clearTimeout: (id) => { /* existing impl */ },
  setInterval: (fn, ms) => { /* existing impl */ },
  clearInterval: (id) => { /* existing impl */ },
};

const hostWatch = {
  watchFile: (path) => { /* existing impl */ },
  watchDirectory: (path) => { /* existing impl */ },
};

const hostCrypto = {
  randomBytes: (length) => Deno.core.ops.op_randomBytes(length),
};

const hostConsole = {
  log: (...args) => Deno.core.ops.op_log(args.join(" ")),
  debug: (...args) => Deno.core.ops.op_debug(args.join(" ")),
};

// Register as runtime modules
globalThis.__hostModules = {
  fs: hostFs,
  http: hostHttp,
  'http/server': hostHttpServer,
  process: hostProcess,
  time: hostTime,
  watch: hostWatch,
  crypto: hostCrypto,
  console: hostConsole,
};
```

## Code Generation

### Import Transformation

When the bundler encounters:
```typescript
import { readFile, writeFile } from "host://fs";
```

It generates:
```javascript
const { readFile, writeFile } = globalThis.__hostModules.fs;
```

### Alternative: Inline in Bundle Preamble

Instead of runtime module lookup, the bundler could inline host module contents in the bundle preamble:

```javascript
// Generated bundle
const __host_fs = {
  readFile: async (path) => Deno.core.ops.op_fsReadFile(path),
  // ...
};
const __host_http = {
  fetch: async (url, init) => { /* ... */ },
};

// User code with transformed imports
const { readFile } = __host_fs;
const { fetch } = __host_http;
// ...
```

**Recommendation:** Use the inline approach — simpler, no runtime lookup overhead.

## Declaration Files

For TypeScript support, create `.d.ts` files for each host module:

### `funee-lib/host/fs.d.ts`
```typescript
export declare function readFile(path: string): Promise<string>;
export declare function readFileBinary(path: string): Promise<Uint8Array>;
export declare function writeFile(path: string, content: string): Promise<void>;
export declare function writeFileBinary(path: string, content: Uint8Array): Promise<void>;
export declare function isFile(path: string): Promise<boolean>;
export declare function exists(path: string): Promise<boolean>;
export declare function lstat(path: string): Promise<{
  size: number;
  is_file: boolean;
  is_directory: boolean;
  modified_ms: number;
}>;
export declare function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
export declare function readdir(path: string): Promise<string[]>;
export declare function tmpdir(): string;
```

### `funee-lib/host/http.d.ts`
```typescript
export declare function fetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response>;
```

### `funee-lib/host/server.d.ts`
```typescript
export interface ServeOptions {
  port?: number;
  hostname?: string;
  handler: (request: Request) => Response | Promise<Response>;
  onListen?: (info: { port: number; hostname: string }) => void;
}

export interface Server {
  port: number;
  hostname: string;
  shutdown(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

export declare function serve(options: ServeOptions): Server;
export declare function createResponse(body?: string | null, init?: ResponseInit): Response;
export declare function createJsonResponse(data: unknown, init?: ResponseInit): Response;
```

### `funee-lib/host/process.d.ts`
```typescript
export interface SpawnOptions {
  cmd: string[];
  cwd?: string;
  env?: Record<string, string>;
  inheritEnv?: boolean;
  stdin?: "piped" | "inherit" | "null";
  stdout?: "piped" | "inherit" | "null";
  stderr?: "piped" | "inherit" | "null";
}

export interface ProcessStatus {
  success: boolean;
  code: number | null;
  signal: string | null;
}

export interface CommandOutput {
  status: ProcessStatus;
  stdout: Uint8Array;
  stderr: Uint8Array;
  stdoutText(): string;
  stderrText(): string;
}

export interface Process {
  readonly pid: number;
  readonly status: Promise<ProcessStatus>;
  kill(signal?: string): void;
  output(): Promise<CommandOutput>;
  writeInput(data: string | Uint8Array): Promise<void>;
}

export declare function spawn(command: string, args?: string[]): Promise<CommandOutput>;
export declare function spawn(options: SpawnOptions): Process;
```

### `funee-lib/host/time.d.ts`
```typescript
export declare function setTimeout(callback: () => void, ms: number): number;
export declare function clearTimeout(id: number): void;
export declare function setInterval(callback: () => void, ms: number): number;
export declare function clearInterval(id: number): void;
```

### `funee-lib/host/watch.d.ts`
```typescript
export interface WatchEvent {
  kind: "create" | "modify" | "remove" | "rename";
  paths: string[];
}

export declare function watchFile(path: string): AsyncIterable<WatchEvent>;
export declare function watchDirectory(path: string, options?: { recursive?: boolean }): AsyncIterable<WatchEvent>;
```

### `funee-lib/host/crypto.d.ts`
```typescript
export declare function randomBytes(length: number): Uint8Array;
```

### `funee-lib/host/console.d.ts`
```typescript
export declare function log(...args: unknown[]): void;
export declare function debug(...args: unknown[]): void;
```

## Backward Compatibility

### Re-exports from "funee"

For a deprecation period, `funee-lib/index.ts` re-exports host functions:

```typescript
// funee-lib/index.ts

// Host function re-exports (deprecated, use host:// imports)
/** @deprecated Import from "host://fs" instead */
export { readFile, writeFile, isFile, exists, lstat, mkdir, readdir, tmpdir } from "host://fs";

/** @deprecated Import from "host://http" instead */
export { fetch } from "host://http";

/** @deprecated Import from "host://http/server" instead */
export { serve, createResponse, createJsonResponse } from "host://http/server";

/** @deprecated Import from "host://process" instead */
export { spawn } from "host://process";

/** @deprecated Import from "host://console" instead */
export { log, debug } from "host://console";

// Non-host exports (stay in funee)
export * from "./macros/index.ts";
export * from "./assertions/index.ts";
export * from "./validator/index.ts";
// etc.
```

## Testing

### Test: Host module resolution
```typescript
// tests/fixtures/host-imports/basic.ts
import { readFile } from "host://fs";
import { log } from "host://console";

export default async () => {
  log("Testing host://fs");
  const content = await readFile("./test.txt");
  log(`Read: ${content}`);
};
```

### Test: Multiple host imports
```typescript
// tests/fixtures/host-imports/multi.ts
import { readFile, writeFile } from "host://fs";
import { fetch } from "host://http";
import { spawn } from "host://process";
import { log } from "host://console";

export default async () => {
  // Test fs
  await writeFile("/tmp/test.txt", "hello");
  const content = await readFile("/tmp/test.txt");
  log(`fs: ${content}`);
  
  // Test spawn
  const result = await spawn("echo", ["hi"]);
  log(`spawn: ${result.stdoutText().trim()}`);
};
```

### Test: Server with dispose
```typescript
// tests/fixtures/host-imports/server.ts
import { serve } from "host://http/server";
import { fetch } from "host://http";
import { log } from "host://console";

export default async () => {
  await using server = serve({
    port: 0,
    handler: () => new Response("ok"),
  });
  
  const res = await fetch(`http://localhost:${server.port}/`);
  log(`status: ${res.status}`);
};
```

## Implementation Tasks

### Task 1: Bundler host:// support
- Modify `load_module.rs` to detect `host://` scheme
- Generate synthetic host modules
- Update import resolution

### Task 2: Code generation
- Modify `source_graph_to_js_execution_code.rs` to handle host imports
- Inline host module implementations in bundle preamble

### Task 3: Type declarations
- Create `funee-lib/host/*.d.ts` files
- Export types for IDE support

### Task 4: Update funee-lib
- Move host function wrappers to use `host://` internally
- Add deprecated re-exports from main index

### Task 5: Update tests
- Create host-import test fixtures
- Add to cli.test.ts
- Update self-hosted tests

### Task 6: Update docs
- Update README
- Add migration guide
