/**
 * 🧪 Funee Validator Demo
 * 
 * Showcases the validator module - a test runner built on funee's
 * assertion library.
 */

import { log } from "host://console";
import { scenario, runScenarios, assertThat, is, Closure } from "funee";

// Helper to create inline closures
const verify = <T>(fn: T): Closure<T> => ({
  expression: fn,
  references: new Map(),
});

// Define our test scenarios
const scenarios = [
  // Basic math
  scenario({
    description: "arithmetic operations work",
    verify: verify(async () => {
      await assertThat(2 + 2, is(4));
      await assertThat(10 * 5, is(50));
      await assertThat(100 / 4, is(25));
      await assertThat(17 % 5, is(2));
    }),
  }),

  // String operations
  scenario({
    description: "strings behave correctly",
    verify: verify(async () => {
      await assertThat("hello".length, is(5));
      await assertThat("abc".toUpperCase(), is("ABC"));
      await assertThat("funee".includes("nee"), is(true));
      await assertThat("x".repeat(3), is("xxx"));
    }),
  }),

  // Boolean logic
  scenario({
    description: "boolean operations work",
    verify: verify(async () => {
      await assertThat(true && true, is(true));
      await assertThat(true || false, is(true));
      await assertThat(!false, is(true));
      await assertThat(5 > 3, is(true));
    }),
  }),

  // Type coercion
  scenario({
    description: "type checks work",
    verify: verify(async () => {
      await assertThat(typeof 42, is("number"));
      await assertThat(typeof "hello", is("string"));
      await assertThat(typeof true, is("boolean"));
      await assertThat(typeof undefined, is("undefined"));
    }),
  }),

  // Functional patterns
  scenario({
    description: "currying and composition work",
    verify: verify(async () => {
      const add = (a: number) => (b: number) => a + b;
      const add5 = add(5);
      await assertThat(add5(10), is(15));
      await assertThat(add5(add5(0)), is(10));
      
      const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A) => f(g(a));
      const double = (x: number) => x * 2;
      const inc = (x: number) => x + 1;
      const doubleAndInc = compose(inc, double);
      await assertThat(doubleAndInc(5), is(11));
    }),
  }),

  // Async without timers
  scenario({
    description: "async promises resolve correctly",
    verify: verify(async () => {
      const fetchValue = async () => 42;
      const value = await fetchValue();
      await assertThat(value, is(42));
      
      const chain = async () => {
        const a = await Promise.resolve(10);
        const b = await Promise.resolve(20);
        return a + b;
      };
      await assertThat(await chain(), is(30));
    }),
  }),
];

// Main entry point
export default async () => {
  log("🚀 Funee Validator Demo");
  log("========================");
  log("");

  const results = await runScenarios(scenarios, { logger: log });

  const failures = results.filter((r) => !r.success).length;
  if (failures > 0) {
    throw new Error(`${failures} scenario(s) failed`);
  }

  log("");
  log("🎉 All scenarios passed!");
  
  return results;
};
