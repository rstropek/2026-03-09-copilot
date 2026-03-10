import OpenAI from 'openai';
import fs from 'fs';
import { readLine } from './input-helper.ts';
import { ResponseInput, EasyInputMessage } from 'openai/resources/responses/responses.mjs';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are an assistant that helps customers to find the right bike. Options are:

* Light, single-speed bike for urban commuting.
* Gravel bike designed to ride on many different surfaces.
* Cargo bike for transporting kids or goods.
* Racing bike for sports.
* Moutainbike designed for off-road cycling.
* All bike types above a also available with electric motors.

Ask the user about how she or he is going to use the bike. Make a suggestion
based on the intended use.

If transporting goods or kids seems to be important for the customer,
mention the option of using a bike trailer as an alternative for cargo bikes.
Point out that bike trailers should not be used with carbon bike frames.

Only answer questions related to bike type selection. If the user asks
questions not related to this topic, tell her or him that you cannot
answer such questions.
`;

const messages: ResponseInput = [
  {
    role: 'developer',
    content: systemPrompt,
  },
  {
    role: 'assistant',
    content: 'How can I help you?',
  },
];

while (true) {
  // print last message in messages
  const lastMessage = messages[messages.length - 1] as EasyInputMessage;
  console.log(`\n🤖: ${lastMessage.content}`);

  // get user input
  const userMessage = await readLine('\nYou (empty to quit): ');
  if (!userMessage) {
    break;
  }

  // add user message to messages
  messages.push({
    role: 'user',
    content: userMessage,
  });

  const response = await client.responses.create({
    model: 'gpt-5.2',
    input: messages,
    store: false,
  });

  messages.push({
    role: 'assistant',
    content: response.output_text,
  });
}
