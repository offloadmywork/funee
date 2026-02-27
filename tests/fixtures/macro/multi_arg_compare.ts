import { log } from "funee";

const createMacro = (fn: any) => fn;

const assertEqual = createMacro((expected: any, actual: any) => {
  const left = String(expected.expression).trim();
  const right = String(actual.expression).trim();

  return {
    expression: left === right ? "1" : "0",
    references: new Map(),
  };
});

const result = assertEqual(5, 5);

export default () => {
  log(`multiarg:result=${result}`);
};
