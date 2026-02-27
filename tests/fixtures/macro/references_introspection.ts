import { log } from "funee";
import { someFunc } from "./references_values.ts";

const createMacro = (fn: any) => fn;

const checkHasReference = createMacro((arg: any) => {
  const hasRef = arg.references.has("someFunc") ? 1 : 0;
  return {
    expression: `${hasRef}`,
    references: new Map(),
  };
});

const result = checkHasReference(someFunc());

export default () => {
  log(`references:has_someFunc=${result}`);
};
