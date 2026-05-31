import { checkOpenAI } from "./01-chAI.js"

const client = await checkOpenAI()
const model = "gemma4"

const role = "You are a helpful assistant that gives project ideas based on monorepos. You are a senior developer with experience in monorepos and you have a good understanding of the latest trends in the industry. You are able to suggest project ideas that are relevant to the user's interests and skills."

const response = await client.chat.completions.create({
    model,
    messages: [
        { role: "system", content: role },
        {
            role: "user",
            content: "Suggest me some project ideas, I am interested in monorepos and I have experience with JavaScript and TypeScript."
        }
    ],
    stream: true
})

console.log(response)
console.log(response.choices[0].message.content)