import { log } from "funee";

const createMacro = (fn: any) => fn;

const makeArray = createMacro((...args: any[]) => {
  return {
    expression: `[${args.map((arg) => arg.expression).join(", ")}]`,
    references: new Map(),
  };
});

const arr = makeArray(1, 2, 3);

export default () => {
  log(`array:first=${arr[0]}`);
  log(`array:third=${arr[2]}`);
};
