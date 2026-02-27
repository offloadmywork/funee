/**
 * Debug: Check if closure macro captures references correctly
 */

import { log } from "host://console";
import { closure } from "funee";
import { add } from "./math.ts";

// Just capture, don't execute
const captured = closure(() => () => add(1, 2));

export default () => {
  log("=== Closure Debug ===");
  log(`captured type: ${typeof captured}`);
  log(`references size: ${captured.references.size}`);
  
  for (const [key, value] of captured.references) {
    log(`ref: ${key} → ${JSON.stringify(value)}`);
  }
  
  log("");
  log("Attempting to call captured.expression()...");
  
  try {
    const innerFn = captured.expression();
    log(`inner function type: ${typeof innerFn}`);
    
    const result = innerFn();
    log(`result: ${result}`);
  } catch (e) {
    log(`ERROR: ${e}`);
  }
  
  return "done";
};
