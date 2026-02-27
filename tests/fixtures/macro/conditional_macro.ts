import { log } from "funee";

const createMacro = (fn: any) => fn;

// If expression is already a multiplication, leave it unchanged.
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

const result = smartDouble(5);

export default () => {
  log(`conditional:result=${result}`);
};
