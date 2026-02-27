import { log } from "funee";

const createMacro = (fn: any) => fn;

const getExprType = createMacro((arg: any) => {
  const expr = String(arg.expression).trim();

  let exprType = "Unknown";
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    exprType = "NumericLiteral";
  } else if (/[+\-*/]/.test(expr)) {
    exprType = "BinaryExpression";
  }

  return {
    expression: `"${exprType}"`,
    references: new Map(),
  };
});

const type = getExprType(5 + 3);

export default () => {
  log(`introspection:type=${type}`);
};
