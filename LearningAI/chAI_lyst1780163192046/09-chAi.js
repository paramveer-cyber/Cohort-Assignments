import { checkOpenAI } from "./01-chAI.js";
import { calculator, calculateTool } from "./tools/calculator.js";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

console.log(client.baseURL);

const tools = [calculateTool];

const messages = [
  {
    role: "user",
    content: "what is result of adding 23 and 54",
  },
];

const firstResponse = await client.chat.completions.create({
  model,
  messages,
  tool_choice: "auto",
  tools,
});

console.log("++++++++++ First Response: ++++++++++");
const assistantMessage = firstResponse.choices[0].message;

console.log(assistantMessage);
console.log(assistantMessage.tool_calls);

messages.push(assistantMessage);

if (assistantMessage.tool_calls) {
  const toolCall = assistantMessage.tool_calls[0];
  const toolResponse = await calculator(toolCall.arguments);
  console.log("++++++++++ Tool Response: ++++++++++");
  console.log(toolResponse);

  messages.push({
    role: "tool",
    name: toolCall.name,
    content: toolResponse,
  });
}

const secondResponse = await client.chat.completions.create({
  model,
  messages,
  tool_choice: "auto",
  tools,
});
