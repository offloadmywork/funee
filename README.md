# funee

A Rust-based TypeScript runtime with compile-time macros, HTTP imports, and declaration-level bundling.

## What is funee?

funee is a TypeScript runtime designed for functional programming. It bundles and executes your code's default export, providing:

- **Compile-time macros** — Transform code at bundle time, not runtime
- **HTTP imports** — Import directly from URLs (like Deno)
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

## Quick Start

```typescript
// hello.ts
import { log } from "funee";

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
```

| Flag | Description |
|------|-------------|
| `--emit` | Print bundled JavaScript instead of executing |
| `--reload` | Bypass HTTP cache, fetch fresh from network |

## Features

### HTTP Server

Create web servers with automatic resource cleanup:

```typescript
import { serve, createResponse, createJsonResponse } from "funee";

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
import { fetch } from "funee";

export default async () => {
  const res = await fetch("https://api.github.com/users/octocat");
  const data = await res.json();
  return data.name;
};
```

### Compile-Time Macros

Transform code at bundle time with full AST access:

```typescript
import { closure, Closure, log } from "funee";

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
import { readFile, writeFile, isFile, readdir, tempDir } from "funee";

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
import { spawn } from "funee";

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
import { scenario, runScenariosWatch, closure, assertThat, is, log } from "funee";
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
  greaterThan, lessThan, scenario, runScenarios, closure, log 
} from "funee";

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

## Standard Library

Import from `"funee"`:

```typescript
import {
  // Core
  log, debug,
  
  // Macros
  Closure, CanonicalName, Definition, createMacro,
  closure, canonicalName, definition,
  
  // HTTP
  fetch, serve, createResponse, createJsonResponse,
  httpGetJSON, httpPostJSON,
  
  // Filesystem
  readFile, writeFile, isFile, lstat, readdir, mkdir,
  join, tmpdir, tempDir,
  
  // Process
  spawn,
  
  // Assertions
  assertThat, is, not, both, contains, matches,
  greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual,
  
  // Testing
  scenario, runScenarios, runScenariosWatch,
  
  // Streams
  fromArray, toArray, map, filter, reduce, pipe,
  fromString, toString, fromBuffer, toBuffer,
  
  // Utilities
  cryptoRandomString, someString, someDirectory,
  
  // Watch
  watchFile, watchDirectory,
} from "funee";
```

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
./target/release/funee tests/self-hosted/basic.ts
./target/release/funee tests/self-hosted/stdlib.ts
./target/release/funee tests/self-hosted/http.ts
./target/release/funee tests/self-hosted/misc.ts

# Run Rust unit tests  
cargo test

# Build release
cargo build --release
```

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
