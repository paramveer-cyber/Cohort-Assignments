import { checkOpenAI } from "./01-chAI.js";

const client = await checkOpenAI();
const model = "gemma4";

const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant that responds in 5 line.",
        },
        { role: "user", content: "What is latest in AI ? Also mention the datetime of the data you are citing" },
    ],
});

let last_chunk = null;

for await (const message of stream) {
    const delta = message.choices[0]?.delta?.content;
    if (delta) {
        process.stdout.write(delta);
    }
    last_chunk += delta;
}
console.log("\n++++++++++ Stream response: ++++++++++");
