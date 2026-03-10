import OpenAI from "openai";
import fs from "fs";
import { readLine } from "./input-helper.ts";
import {
  ResponseInput,
  EasyInputMessage,
} from "openai/resources/responses/responses.mjs";
import dotenv from "dotenv";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { InsuranceClaimSchema } from "./schema.ts";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are an assistant whose job it is to extract structured data from text
`;

const userMessage = fs.readFileSync("./email2.txt", "utf-8");

const response = await client.responses.parse({
  model: "gpt-5.2",
  instructions: systemPrompt,
  input: userMessage,
  text: { format: zodTextFormat(InsuranceClaimSchema, "insurance_claim") },
  store: false,
});

if (response.output_parsed) {
  console.log(JSON.stringify(response.output_parsed, null, 2));
}
