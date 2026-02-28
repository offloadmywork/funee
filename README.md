# funee

A Rust-based TypeScript runtime with compile-time macros, HTTP imports, and declaration-level bundling.

## What is funee?

funee is a TypeScript runtime designed for functional programming. It bundles and executes your code's default export, providing:

- **Compile-time macros** — Transform code at bundle time, not runtime
- **HTTP imports** — Import directly from URLs (like Deno)
- **Host imports (`host://`)** — Explicit host-provided capabilities
- **Declaration-level tree-shaking** — Only include what's actually used
- **Full runtime** — HTTP server, fetch, filesystem, subprocess, timers
- **`using` keyword support** — TypeScript 5.2+ explicit resource management
- **Watch mode** — Re-run on file changes with closure-level tracking

## Installation

```bash
# Build from source
cargo build --release

# Binary at target/release/funee
```

```bash
# Install from GitHub Releases (recommended for stable runner binaries)
# 1) Download funee-vX.Y.Z-<target>.tar.gz from the Releases page
# 2) Extract and move bin/funee into your PATH
# 3) Keep funee-lib/ next to the binary's parent directory
```

## Quick Start

```typescript
// hello.ts
import { log } from "host://console";

export default () => {
  log("Hello, funee!");
};
```

```bash
$ funee hello.ts
Hello, funee!
```

## CLI

```bash
# Run a TypeScript file (executes default export)
funee main.ts

# Emit bundled JavaScript without executing
funee --emit main.ts

# Bypass HTTP cache and fetch fresh
funee --reload main.ts

# Print runtime version
funee --version
```

| Flag | Description |
|------|-------------|
| `--emit` | Print bundled JavaScript instead of executing |
| `--reload` | Bypass HTTP cache, fetch fresh from network |
| `--version` | Print funee version and exit |

## Features

### HTTP Server

Create web servers with automatic resource cleanup:

```typescript
import { serve, createResponse, createJsonResponse } from "host://http/server";

export default async () => {
  await using server = serve({
    port: 3000,
    handler: async (req) => {
      if (req.url === "/api/hello") {
        return createJsonResponse({ message: "Hello!" });
      }
      return createResponse("Not found", { status: 404 });
    },
  });
  
  console.log(`Server running on port ${server.port}`);
  // Server auto-shuts down when scope exits
};
```

### Fetch API

Web-standard fetch with full Response/Headers support:

```typescript
import { fetch } from "host://http";

export default async () => {
  const res = await fetch("https://api.github.com/users/octocat");
  const data = await res.json();
  return data.name;
};
```

### Compile-Time Macros

Transform code at bundle time with full AST access:

```typescript
import { closure, Closure } from "funee";
import { log } from "host://console";

// closure macro captures the expression as AST
const add = closure((a: number, b: number) => a + b);

export default () => {
  log(`Expression type: ${add.expression.type}`);
  // "ArrowFunctionExpression"
  
  log(`References: ${add.references.size}`);
  // Captured scope references
};
```

Built-in macros:
- `closure(expr)` — Capture expression AST and scope references
- `canonicalName(ref)` — Get `{ uri, name }` for any reference
- `definition(ref)` — Get declaration AST and its references

### HTTP Imports

Import modules directly from URLs with caching:

```typescript
import { add } from "https://esm.sh/lodash-es@4.17.21/add";

export default () => add(1, 2);
```

- Cached at `~/.funee/cache/`
- Stale cache fallback on network failures
- Redirect handling
- Relative imports from HTTP modules work correctly

### File System

```typescript
import { readFile, writeFile, isFile, readdir, tempDir } from "host://fs";

export default async () => {
  // Disposable temp directory (auto-deletes on scope exit)
  await using tmp = tempDir();
  
  await writeFile(`${tmp.path}/data.txt`, "Hello!");
  const content = await readFile(`${tmp.path}/data.txt`);
  
  const files = await readdir(tmp.path);
  const exists = await isFile(`${tmp.path}/data.txt`);
};
```

### Subprocess

```typescript
import { spawn } from "host://process";

export default async () => {
  // Simple form — run and capture output
  const result = await spawn("echo", ["Hello, world!"]);
  console.log(result.stdoutText()); // "Hello, world!\n"
  console.log(result.status.code);  // 0
  
  // Advanced form — streaming with options
  const proc = spawn({
    cmd: ["cat"],
    stdin: "piped",
    stdout: "piped",
    cwd: "/tmp",
    env: { MY_VAR: "value" },
  });
  await proc.writeInput("Hello");
  const output = await proc.output();
};
```

### Timers

```typescript
import { setTimeout, clearTimeout, setInterval, clearInterval } from "host://time";

export default async () => {
  // setTimeout with cancellation
  const id = setTimeout(() => console.log("fired"), 1000);
  clearTimeout(id);
  
  // setInterval
  let count = 0;
  const intervalId = setInterval(() => {
    console.log(++count);
    if (count >= 3) clearInterval(intervalId);
  }, 100);
};
```

### Watch Mode

Re-run scenarios when referenced files change:

```typescript
import { scenario, runScenariosWatch, closure, assertThat, is } from "funee";
import { log } from "host://console";
import { add } from "./math.ts";

const scenarios = [
  scenario({
    description: "add works correctly",
    verify: closure(async () => {
      await assertThat(add(2, 3), is(5));
    }),
  }),
];

export default async () => {
  // Watches files referenced by closure macro
  await runScenariosWatch(scenarios, { logger: log });
};
```

### Assertions & Testing

```typescript
import { 
  assertThat, is, not, both, contains, matches,
  greaterThan, lessThan, scenario, runScenarios, closure
} from "funee";
import { log } from "host://console";

const scenarios = [
  scenario({
    description: "string assertions",
    verify: closure(async () => {
      await assertThat("hello world", contains("world"));
      await assertThat("test@example.com", matches(/^[\w]+@[\w]+\.\w+$/));
    }),
  }),
  scenario({
    description: "numeric comparisons",
    verify: closure(async () => {
      await assertThat(10, greaterThan(5));
      await assertThat(3, lessThan(10));
      await assertThat(42, both(greaterThan(0), lessThan(100)));
    }),
  }),
];

export default async () => {
  await runScenarios(scenarios, { logger: log });
};
```

### Streams (Async Iterables)

```typescript
import { fromArray, toArray, map, filter, pipe } from "funee";

export default async () => {
  const numbers = fromArray([1, 2, 3, 4, 5]);
  
  const result = await pipe(
    numbers,
    filter((n) => n % 2 === 0),
    map((n) => n * 10),
    toArray
  );
  
  return result; // [20, 40]
};
```

### Tree-Shaking

funee only includes declarations that are actually referenced:

```typescript
// utils.ts
export const used = () => "included";
export const unused = () => "removed";

// main.ts
import { used } from "./utils.ts";
export default () => used();
// Output: only `used` appears
```

## Import Structure

funee uses a two-layer import system:

### Host Imports (`host://`)

Host-provided runtime capabilities — things that require the native runtime:

```typescript
// File system
import { readFile, writeFile, isFile, lstat, readdir, mkdir, tmpdir, tempDir } from "host://fs";

// HTTP client
import { fetch, httpGetJSON, httpPostJSON } from "host://http";

// HTTP server
import { serve, createResponse, createJsonResponse } from "host://http/server";

// Subprocess
import { spawn } from "host://process";

// Timers
import { setTimeout, clearTimeout, setInterval, clearInterval } from "host://time";

// File watching
import { watchFile, watchDirectory } from "host://watch";

// Crypto
import { randomBytes } from "host://crypto";

// Console
import { log, debug } from "host://console";
```

### Library Imports (`"funee"`)

Pure JavaScript/TypeScript library code — works anywhere:

```typescript
import {
  // Macros (compile-time)
  Closure, CanonicalName, Definition, createMacro,
  closure, canonicalName, definition,
  
  // Assertions (pure JS)
  assertThat, is, not, both, contains, matches,
  greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual,
  
  // Testing framework
  scenario, runScenarios, runScenariosWatch,
  
  // Streams (async iterables)
  fromArray, toArray, map, filter, reduce, pipe,
  fromString, toString, fromBuffer, toBuffer,
  
  // Utilities
  cryptoRandomString, someString, someDirectory,
  join, // path joining is pure string manipulation
} from "funee";
```

### Why `host://`?

The `host://` scheme makes host dependencies explicit:

1. **Clear contract** — See exactly what runtime capabilities a module needs
2. **Portability** — Pure `"funee"` imports work in any JavaScript environment
3. **Alternative runtimes** — Browser, edge workers, etc. can provide different `host://` implementations
4. **Testing** — Easy to mock `host://` imports
5. **Tree-shaking** — Unused host modules aren't loaded

### Migration Guide

Moving from old-style imports to `host://`:

```typescript
// ❌ Old way (deprecated)
import { readFile, writeFile } from "funee";
import { fetch } from "funee";
import { serve } from "funee";
import { spawn } from "funee";
import { log, debug } from "funee";

// ✅ New way
import { readFile, writeFile } from "host://fs";
import { fetch } from "host://http";
import { serve } from "host://http/server";
import { spawn } from "host://process";
import { log, debug } from "host://console";
```

**Quick reference:**

| Old import | New import |
|------------|------------|
| `readFile`, `writeFile`, `isFile`, `readdir`, `mkdir`, `tmpdir`, `tempDir` | `host://fs` |
| `fetch`, `httpGetJSON`, `httpPostJSON` | `host://http` |
| `serve`, `createResponse`, `createJsonResponse` | `host://http/server` |
| `spawn` | `host://process` |
| `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval` | `host://time` |
| `watchFile`, `watchDirectory` | `host://watch` |
| `randomBytes` | `host://crypto` |
| `log`, `debug` | `host://console` |

## Architecture

Built in Rust using:
- **SWC** — TypeScript parsing and code generation
- **deno_core** — JavaScript runtime (V8)
- **hyper** — HTTP server
- **reqwest** — HTTP client
- **notify** — File system watching
- **petgraph** — Dependency graph analysis

The functional-only design (no classes) enables aggressive optimizations and clean macro semantics.

## Development

```bash
# Run vitest tests
cd tests && npm test

# Run self-hosted tests (funee testing funee)
./scripts/prepare-sut.sh
./scripts/run-self-hosted.sh

# Optional: choose runner and SUT explicitly
FUNEE_RUNNER_BIN=/usr/local/bin/funee \
FUNEE_SUT_BIN=$PWD/target/sut/funee \
./scripts/run-self-hosted.sh

# Run Rust unit tests  
cargo test

# Build release
cargo build --release
```

Release workflow details: `docs/RELEASE_PROCESS.md`.

## Test Status

- ✅ **163 vitest tests** passing
- ✅ **140 self-hosted tests** passing (funee testing funee)
- ✅ Macro system complete
- ✅ HTTP imports with caching
- ✅ HTTP server with async dispose
- ✅ Fetch API (web-standard)
- ✅ File system operations
- ✅ Subprocess spawning
- ✅ Watch mode with closure tracking
- ✅ TypeScript `using` keyword support

## License

MIT
