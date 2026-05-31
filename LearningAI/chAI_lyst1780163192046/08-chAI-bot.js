import { checkOpenAI } from "./01-chAI.js";
import readline from "readline";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

console.log(client.baseURL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const systemPrompt = "You are a helpful assistant that responds in 5 line.";

function askQuestion(userPrompt) {
  return new Promise((resolve) => {
    rl.question(userPrompt, (answer) => {
      resolve(answer);
    });
  });
}

while (true) {
  const userQuestion = await askQuestion("Ask a question: ");
  if (userQuestion.toLowerCase() === "exit") {
    console.log("Exiting...");
    break;
  }

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuestion },
    ],
  });
  process.stdout.write("Chai Bot: ");
  for await (const message of stream) {
    const delta = message.choices[0]?.delta?.content;
    if (delta) {
      process.stdout.write(delta);
    }
  }
  console.log("\n");
}

rl.close();
