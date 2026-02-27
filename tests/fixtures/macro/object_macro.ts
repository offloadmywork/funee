import { log } from "funee";

const createMacro = (fn: any) => fn;

const makeConfig = createMacro((nameArg: any, valueArg: any) => {
  return {
    expression: `({ name: ${nameArg.expression}, value: ${valueArg.expression} })`,
    references: new Map(),
  };
});

const config = makeConfig("test", 42);

export default () => {
  log(`object:name=${config.name}`);
  log(`object:value=${config.value}`);
};
