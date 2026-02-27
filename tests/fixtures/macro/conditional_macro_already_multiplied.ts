import { log } from "funee";

const createMacro = (fn: any) => fn;

const smartDouble = createMacro((arg: any) => {
  const expr = String(arg.expression).trim();
  if (expr.includes("*")) {
    return {
      expression: expr,
      references: arg.references,
    };
  }

  return {
    expression: `(${expr}) * 2`,
    references: arg.references,
  };
});

const result = smartDouble(5 * 2);

export default () => {
  log(`conditional_already_multiplied:result=${result}`);
};
