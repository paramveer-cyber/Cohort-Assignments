export async function calculator({ op, a, b }) {
  if (typeof a !== "number" || typeof b !== "number") {
    return "Both a and b should be numbers.";
  }
  switch (op) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      if (b === 0) {
        return "Cannot divide by zero.";
      }
      return a / b;
    default:
      return "Unsupported operation. Use add, subtract, multiply, or divide.";
  }
}

export const calculateTool = {
    type: "function",
    function: {
        name: "calculator",
        description: "A simple calculator function that performs basic arithmetic operations.",
        parameters: {
            type: "object",
            properties: {
                op: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
                a: { type: "number" },
                b: { type: "number" },
            },
            required: ["op", "a", "b"],
        }
    }

}
