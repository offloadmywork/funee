import { log } from "funee";

const createMacro = (fn: any) => fn;

const getProperty = createMacro((objArg: any, propArg: any) => {
  return {
    expression: `(${objArg.expression})[${propArg.expression}]`,
    references: objArg.references,
  };
});

const obj = { value: 42, name: "test" };
const value = getProperty(obj, "value");

export default () => {
  log(`member:value=${value}`);
};
