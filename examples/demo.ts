/**
 * 🎸 Funee Capabilities Demo
 */

import { log } from "host://console";
import { writeFile, readFile, isFile, tmpdir } from "host://fs";
import { assertThat, is, cryptoRandomString } from "funee";

export default async () => {
  // ═══════════════════════════════════════════════════════════════
  log("═".repeat(60));
  log("📁 FILE I/O");
  log("═".repeat(60));
  log("");

  const testFile = `/tmp/funee-demo-${Date.now()}.txt`;
  const content = "Hello from funee! 🎸\nThis is a test file.";

  await writeFile(testFile, content);
  log(`✓ Wrote: ${testFile}`);

  const readBack = await readFile(testFile);
  log(`✓ Read back: "${readBack.split("\n")[0]}"`);

  const exists = await isFile(testFile);
  log(`✓ File exists: ${exists}`);
  log("");

  // ═══════════════════════════════════════════════════════════════
  log("═".repeat(60));
  log("✅ ASSERTIONS");
  log("═".repeat(60));
  log("");

  await assertThat(2 + 2, is(4));
  log("✓ assertThat(2 + 2, is(4))");

  await assertThat("hello".length, is(5));
  log("✓ assertThat('hello'.length, is(5))");

  await assertThat(typeof 42, is("number"));
  log("✓ assertThat(typeof 42, is('number'))");

  await assertThat(true || false, is(true));
  log("✓ assertThat(true || false, is(true))");
  log("");

  // ═══════════════════════════════════════════════════════════════
  log("═".repeat(60));
  log("🎲 RANDOM & UTILS");
  log("═".repeat(60));
  log("");

  const randomStr = cryptoRandomString(16);
  log(`✓ cryptoRandomString(16): ${randomStr}`);

  const temp = tmpdir();
  log(`✓ tmpdir(): ${temp}`);
  log("");

  // ═══════════════════════════════════════════════════════════════
  log("═".repeat(60));
  log("🧮 FUNCTIONAL PATTERNS");
  log("═".repeat(60));
  log("");
  
  // Currying by hand
  const add = (a: number) => (b: number) => a + b;
  const add10 = add(10);
  log(`✓ Currying: add(10)(5) = ${add10(5)}`);
  log(`✓ Currying: add(10)(20) = ${add10(20)}`);
  
  // Composition
  const double = (x: number) => x * 2;
  const inc = (x: number) => x + 1;
  const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A) => f(g(a));
  const doubleAndInc = compose(inc, double);
  log(`✓ Composition: doubleAndInc(5) = ${doubleAndInc(5)}`);
  log("");

  // ═══════════════════════════════════════════════════════════════
  log("═".repeat(60));
  log("🎉 Demo complete!");
  log("═".repeat(60));

  return "done";
};
