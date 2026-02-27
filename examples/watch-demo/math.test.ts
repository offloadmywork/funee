/**
 * 🧪 Watch Mode Demo - Closure-Level Dependency Tracking
 * 
 * Run with: funee examples/watch-demo/math.test.ts
 * 
 * The `closure` macro captures references at BUILD TIME (returns AST).
 * For RUNTIME execution, we construct closures with inline expressions.
 * The references Map still tells the watcher which files matter.
 */

import { log } from "host://console";
import { scenario, runScenarios, assertThat, is, Closure } from "funee";

import { add, multiply } from "./math.ts";

// Runtime closures: expression is callable, references are explicit
// The closure macro would generate this at build time
const thisFile = "/Users/netanelgilad/clawd/agents/riff/repos/funee/examples/watch-demo/math.ts";

const scenarios = [
  scenario({
    description: "add() works correctly",
    verify: {
      expression: async () => {
        await assertThat(add(2, 3), is(5));
        await assertThat(add(0, 0), is(0));
        await assertThat(add(-1, 1), is(0));
      },
      references: new Map([["add", { uri: thisFile, name: "add" }]]),
    } as Closure<() => Promise<void>>,
  }),

  scenario({
    description: "multiply() works correctly", 
    verify: {
      expression: async () => {
        await assertThat(multiply(2, 3), is(6));
        await assertThat(multiply(0, 5), is(0));
        await assertThat(multiply(-2, 3), is(-6));
      },
      references: new Map([["multiply", { uri: thisFile, name: "multiply" }]]),
    } as Closure<() => Promise<void>>,
  }),

  scenario({
    description: "add and multiply compose",
    verify: {
      expression: async () => {
        const result = multiply(add(2, 3), 4);
        await assertThat(result, is(20));
      },
      references: new Map([
        ["add", { uri: thisFile, name: "add" }],
        ["multiply", { uri: thisFile, name: "multiply" }],
      ]),
    } as Closure<() => Promise<void>>,
  }),
];

export default async () => {
  log("🧪 Funee Watch Mode Demo");
  log("========================");
  log("");
  log("📦 math.ts exports: add, multiply, subtract, divide, modulo");
  log("✅ Tests USE: add, multiply");
  log("❌ Tests IGNORE: subtract, divide, modulo");
  log("");

  const results = await runScenarios(scenarios, { logger: log });
  
  log("");
  log("─".repeat(55));
  log("💡 HOW IT WORKS:");
  log("");
  log("   Each scenario.verify.references tells the watcher:");
  log("   'I depend on add from math.ts'");
  log("");
  log("   When watching, ONLY changes to referenced declarations");
  log("   trigger a re-run. Other exports in the same file are ignored.");
  log("─".repeat(55));
  
  return results;
};
