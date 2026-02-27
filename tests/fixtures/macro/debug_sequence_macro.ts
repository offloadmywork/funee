import { log } from "funee";

const createMacro = (fn: any) => fn;

const debug = createMacro((arg: any) => {
  const exprType = String(arg.expression).includes("+")
    ? "BinaryExpression"
    : "Expression";

  return {
    expression: `(log("[DEBUG] Expression type: ${exprType}"), (${arg.expression}))`,
    references: arg.references,
  };
});

const x = 5;
const y = 10;
const result = debug(x + y);

export default () => {
  log(`debug:result=${result}`);
};
