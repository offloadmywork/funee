import { log } from "funee";

const createMacro = (fn: any) => fn;

const countNumericArgs = createMacro((...args: any[]) => {
  let count = 0;
  for (const arg of args) {
    const expr = String(arg.expression).trim();
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      count++;
    }
  }

  return {
    expression: `${count}`,
    references: new Map(),
  };
});

const count = countNumericArgs(5, "hello", 10);

export default () => {
  log(`variadic:count=${count}`);
};
