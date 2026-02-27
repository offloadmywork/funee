# Host Functions Design

## Overview

Host functions are capabilities provided by the runtime, not implemented in JavaScript. They represent interfaces that the host must fulfill. By making this explicit with a `host://` import scheme, we:

1. **Clarify the runtime contract** — What the host must provide
2. **Enable alternative hosts** — Different runtimes can implement the same interfaces
3. **Separate concerns** — Pure library code vs host-dependent code
4. **Make dependencies visible** — Easy to see what host capabilities a module needs

## Current Host Operations

These are the Rust ops currently exposed to JavaScript:

### File System (`host://fs`)
- `readFile(path: string): Promise<string>`
- `readFileBinary(path: string): Promise<Uint8Array>`
- `writeFile(path: string, content: string): Promise<void>`
- `writeFileBinary(path: string, content: Uint8Array): Promise<void>`
- `isFile(path: string): Promise<boolean>`
- `exists(path: string): Promise<boolean>`
- `lstat(path: string): Promise<FileStat>`
- `mkdir(path: string): Promise<void>`
- `readdir(path: string): Promise<string[]>`
- `tmpdir(): string`

### HTTP (`host://http`)
- `fetch(url: string, options?: RequestInit): Promise<Response>`

### HTTP Server (`host://http/server`)
- `serve(options: ServeOptions): Server`

### Process (`host://process`)
- `spawn(cmd: string[], options?: SpawnOptions): Process`

### Timers (`host://time`)
- `setTimeout(callback: () => void, ms: number): number`
- `clearTimeout(id: number): void`
- `setInterval(callback: () => void, ms: number): number`
- `clearInterval(id: number): void`

### Watch (`host://watch`)
- `watchFile(path: string): AsyncIterable<WatchEvent>`
- `watchDirectory(path: string): AsyncIterable<WatchEvent>`

### Crypto (`host://crypto`)
- `randomBytes(length: number): Uint8Array`

### Console (`host://console`)
- `log(...args: any[]): void`
- `debug(...args: any[]): void`

## URL Scheme Design

```
host://<namespace>/<optional-path>
```

### Proposed Namespaces

| Namespace | Description | Exports |
|-----------|-------------|---------|
| `host://fs` | File system operations | readFile, writeFile, isFile, exists, lstat, mkdir, readdir, tmpdir |
| `host://http` | HTTP client | fetch |
| `host://http/server` | HTTP server | serve |
| `host://process` | Subprocess spawning | spawn |
| `host://time` | Timers | setTimeout, clearTimeout, setInterval, clearInterval |
| `host://watch` | File watching | watchFile, watchDirectory |
| `host://crypto` | Cryptographic utilities | randomBytes |
| `host://console` | Logging | log, debug |

### Import Examples

```typescript
// Before (importing from "funee")
import { readFile, writeFile } from "funee";
import { fetch } from "funee";
import { serve } from "funee";
import { spawn } from "funee";
import { log, debug } from "funee";

// After (importing from host://)
import { readFile, writeFile, isFile } from "host://fs";
import { fetch } from "host://http";
import { serve } from "host://http/server";
import { spawn } from "host://process";
import { log, debug } from "host://console";
import { setTimeout, clearTimeout } from "host://time";
import { watchFile, watchDirectory } from "host://watch";
import { randomBytes } from "host://crypto";
```

## What Stays in "funee"?

The `"funee"` import becomes pure JavaScript/TypeScript library code:

```typescript
import { 
  // Macros (compile-time, not host functions)
  closure, canonicalName, definition,
  Closure, CanonicalName, Definition, createMacro,
  
  // Assertions (pure JS)
  assertThat, is, not, both, contains, matches,
  greaterThan, lessThan,
  
  // Testing framework (pure JS, uses host://time internally)
  scenario, runScenarios, runScenariosWatch,
  
  // Streams/axax (pure JS async iterables)
  fromArray, toArray, map, filter, reduce, pipe,
  
  // Utilities (pure JS)
  join, // path joining is pure string manipulation
} from "funee";
```

## Implementation Plan

### Phase 1: Bundler Support for `host://` URLs

1. **Modify `load_module.rs`** to recognize `host://` scheme
2. **Create host module stubs** that re-export from runtime bootstrap
3. **Update `http_loader.rs`** to handle `host://` specially (not HTTP fetch)

### Phase 2: Create Host Module Definitions

Create TypeScript declaration files for each host namespace:

```
funee-lib/
  host/
    fs.ts        # host://fs
    http.ts      # host://http  
    server.ts    # host://http/server
    process.ts   # host://process
    time.ts      # host://time
    watch.ts     # host://watch
    crypto.ts    # host://crypto
    console.ts   # host://console
```

### Phase 3: Update funee-lib

1. **Move host function wrappers** to `funee-lib/host/*.ts`
2. **Update internal imports** in funee-lib to use `host://`
3. **Re-export from funee-lib/index.ts** for backward compatibility (deprecation period)

### Phase 4: Update Tests & Examples

1. Update all test fixtures to use `host://` imports
2. Update examples
3. Update README

### Phase 5: Deprecation Path

For backward compatibility:
```typescript
// funee-lib/index.ts
// @deprecated Use host://fs instead
export { readFile, writeFile } from "host://fs";
// @deprecated Use host://http instead  
export { fetch } from "host://http";
```

## Alternative Considered: `runtime://` or `builtin://`

| Scheme | Pros | Cons |
|--------|------|------|
| `host://` | Clear "provided by host" semantics | Could confuse with hostnames |
| `runtime://` | Clear it's runtime-provided | Longer |
| `builtin://` | Node.js precedent | Less clear about replaceability |
| `native://` | Clear it's native code | Could confuse with native modules |

**Decision:** `host://` — Short, clear semantics about the host/guest boundary.

## Type Safety

Each `host://` module has full TypeScript types:

```typescript
// host://fs types
export declare function readFile(path: string): Promise<string>;
export declare function writeFile(path: string, content: string): Promise<void>;
export declare function isFile(path: string): Promise<boolean>;
// ...

// host://http types
export declare function fetch(
  url: string | URL,
  init?: RequestInit
): Promise<Response>;

// host://process types
export interface SpawnOptions {
  cmd: string[];
  cwd?: string;
  env?: Record<string, string>;
  stdin?: "piped" | "inherit" | "null";
  stdout?: "piped" | "inherit" | "null";
  stderr?: "piped" | "inherit" | "null";
}
export declare function spawn(options: SpawnOptions): Process;
export declare function spawn(cmd: string, args?: string[]): Promise<CommandOutput>;
```

## Benefits

1. **Explicit host dependency** — Easy to see what a module needs from the host
2. **Portable code** — Pure `"funee"` imports work anywhere
3. **Alternative runtimes** — Browser, edge workers, etc. can provide different `host://` implementations
4. **Tree-shaking** — Unused host modules aren't loaded
5. **Documentation** — The URL itself documents what capability is needed
6. **Testing** — Easy to mock `host://` imports in tests

## Open Questions

1. **Should timers be globals or imports?** — Currently `setTimeout` is a global. Keep as global for compatibility?
2. **Version in URL?** — `host://fs@1` for future breaking changes?
3. **Capability detection?** — `import { available } from "host://fs"` to check if host provides it?
