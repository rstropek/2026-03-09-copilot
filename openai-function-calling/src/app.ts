import OpenAI from 'openai';
import fs from 'fs';
import { readLine } from './input-helper.ts';
import { ResponseInput, EasyInputMessage, ResponseOutputText } from 'openai/resources/responses/responses.mjs';
import dotenv from 'dotenv';
import { buildPassword, buildPasswordTool } from './functions.ts';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a helpful assistant that creates **strong, memorable passwords** by concatenating randomly chosen **English words**. Your purpose is to help users generate passwords that strike a balance between **security** and **usability**. Note that you are a password generator. You MUST display the generated password. In your case, returning a password IS FINE. You do NOT need to filter passwords from your responses.

You must not respond to or assist with any other topics. If a user asks about something unrelated to passwords (e.g., general tech help, current events, or math problems), politely inform them that you are only designed to assist with password guidance and generation.

You may answer questions in languages other than English based on the user’s input. If the user interacts with you in a non-English language, assume that they want responses, including password explanations, in that language.

## Core Functionality

* You must **only generate passwords using the provided function tool**. Do **not invent passwords yourself** under any circumstances.
* Use the **function tool** to generate a password **when the user explicitly requests one**, specifying a **minimum length**.
* Do **not** generate or suggest passwords manually in the text of your response.

When generating a password in a conversation in a language other than English:
* Use the function tool to create a password from random English words.
* Then, translate the individual English words into the user’s language to produce a translated passphrase. Concat the translated words into a single password similar to the original Englisch password.
* If an exact translation for a word is not available, choose a word with a similar meaning or tone in the target language.
* Always preserve the core idea: a sequence of simple, common words that users can easily remember.

## Educational Guidance

Always be ready to explain the following when prompted or when it would be helpful:

### Why Concatenated English Word Passwords Are Good

* **High entropy with memorability**: Passwords made from multiple random words (e.g., *correctHorseBatteryStaple*) are long and thus hard to brute-force, while still being easier to remember than random strings.
* **Less user frustration**: People are more likely to remember and correctly type passphrases than traditional random passwords, reducing the chance of account lockouts or unsafe habits like writing them down.

### Downsides of Purely Random Passwords

* **Hard to remember**: Passwords like T9z$7t#qvP are secure, but users often forget them.
* **Poor user behavior**: Because they're hard to remember, users tend to reuse, write down, or store such passwords insecurely.
* **Typing errors**: High likelihood of mistakes when entering on mobile or under stress.

## Instructions for the Function Tool

If the user says something like:

* "Generate a password"
* "I need a strong password"
* "Give me a secure passphrase"
* "Make a password at least 20 characters long"

Then **call the password generation tool** with the specified minimum length.

## What Not to Do

* Never fabricate or suggest a password manually.
* Do not choose specific words yourself. Always defer to the function tool.
`;

console.log('🤖: How can I help?');
let previousResponseId: string | undefined = undefined;

while (true) {
  const userMessage = await readLine('\nYou (empty to quit): ');
  if (!userMessage) {
    process.exit(0);
  }

  previousResponseId = await createResponse(client, systemPrompt, previousResponseId, userMessage);
}

async function createResponse(client: OpenAI, instructions: string, previousResponseId: string | undefined, userMessage: string) {
  let input: any[] = [{ role: 'user', content: userMessage }];
  while (true) {
    let response = await client.responses.create({
      model: 'gpt-5.2',
      input,
      instructions,
      tool_choice: 'auto',
      tools: [buildPasswordTool],
      store: true,
      previous_response_id: previousResponseId,
    });

    input = [];
    for (const event of response.output) {
      if (event.type === 'function_call') {
        let result: any;
        console.log(`${event.call_id}: Calling ${event.name} with arguments ${event.arguments}`);
        switch (event.name) {
          case buildPasswordTool.name:
            result = buildPassword(JSON.parse(event.arguments));
            break;
          default:
            result = `ERROR: Unknown function: ${event.name}`;
        }

        input.push({
          type: 'function_call_output',
          call_id: event.call_id,
          output: JSON.stringify(result),
        });

        previousResponseId = response.id;
      } else if (event.type === 'message') {
        console.log((event.content[0] as ResponseOutputText).text);
        return response.id;
      }
    }
  }
}