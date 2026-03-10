import OpenAI from "openai";
import type {
	FunctionTool,
	ResponseInput,
} from "openai/resources/responses/responses";
import { createHero, getAllHeroes, getHeroById } from "../../../data/heroes";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const instructions = `You are a superhero expert assistant for the Superfan app.
Help users explore, learn about, and add superheroes to the database.
Use the provided tools to interact with the hero database.
When listing heroes, present them in a readable format.
When showing hero details, format all fields nicely.
When adding a hero, confirm the created hero details back to the user.
Be enthusiastic and use a comic-book tone!`;

const listHeroesTool: FunctionTool = {
	type: "function",
	name: "listHeroes",
	description:
		"List all heroes in the database. Returns id and name for each hero. Optionally filter by name.",
	parameters: {
		type: "object",
		properties: {
			nameFilter: {
				type: "string",
				description: "Optional filter to search heroes by name (partial match)",
			},
		},
		required: [],
		additionalProperties: false,
	},
	strict: false,
};

const getHeroByIdTool: FunctionTool = {
	type: "function",
	name: "getHeroById",
	description:
		"Get full details of a hero by their ID. Returns name, real_name, first_appearance, super_powers, and coolness_factor.",
	parameters: {
		type: "object",
		properties: {
			id: {
				type: "integer",
				description: "The ID of the hero to look up",
			},
		},
		required: ["id"],
		additionalProperties: false,
	},
	strict: true,
};

const addHeroTool: FunctionTool = {
	type: "function",
	name: "addHero",
	description: "Add a new hero to the database.",
	parameters: {
		type: "object",
		properties: {
			name: { type: "string", description: "The hero name" },
			real_name: {
				type: ["string", "null"],
				description: "The real name of the hero, or null if unknown",
			},
			first_appearance: {
				type: "string",
				description: "When/where the hero first appeared (e.g. a comic issue)",
			},
			super_powers: {
				type: "array",
				items: { type: "string" },
				description: "List of super powers",
			},
			coolness_factor: {
				type: "integer",
				description: "Coolness rating from 0 to 5",
			},
		},
		required: [
			"name",
			"real_name",
			"first_appearance",
			"super_powers",
			"coolness_factor",
		],
		additionalProperties: false,
	},
	strict: true,
};

const tools = [listHeroesTool, getHeroByIdTool, addHeroTool];

function executeTool(name: string, args: string): string {
	const parsed = JSON.parse(args);
	switch (name) {
		case "listHeroes": {
			const heroes = getAllHeroes(parsed.nameFilter);
			return JSON.stringify(heroes.map((h) => ({ id: h.id, name: h.name })));
		}
		case "getHeroById": {
			const hero = getHeroById(parsed.id);
			if (!hero) return JSON.stringify({ error: "Hero not found" });
			return JSON.stringify(hero);
		}
		case "addHero": {
			const hero = createHero({
				name: parsed.name,
				real_name: parsed.real_name ?? null,
				first_appearance: parsed.first_appearance,
				super_powers: parsed.super_powers ?? [],
				coolness_factor: parsed.coolness_factor ?? 3,
			});
			return JSON.stringify(hero);
		}
		default:
			return JSON.stringify({ error: `Unknown tool: ${name}` });
	}
}

export async function POST(request: Request) {
	const body = await request.json();
	const { message, previousResponseId } = body;

	if (!message || typeof message !== "string") {
		return new Response(JSON.stringify({ error: "message is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			function send(event: string, data: string) {
				controller.enqueue(
					encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
				);
			}

			try {
				const input: ResponseInput = [{ role: "user", content: message }];

				let response = await client.responses.create({
					model: "gpt-4o",
					instructions,
					input,
					tools,
					tool_choice: "auto",
					store: true,
					stream: true,
					...(previousResponseId
						? { previous_response_id: previousResponseId }
						: {}),
				});

				let currentResponseId = "";

				// Process streaming events, handling tool calls in a loop
				while (true) {
					const toolCalls: {
						callId: string;
						name: string;
						args: string;
					}[] = [];

					for await (const event of response) {
						if (event.type === "response.created") {
							currentResponseId = event.response.id;
						} else if (event.type === "response.output_text.delta") {
							send("text", event.delta);
						} else if (event.type === "response.output_item.done") {
							if (event.item.type === "function_call") {
								toolCalls.push({
									callId: event.item.call_id,
									name: event.item.name,
									args: event.item.arguments,
								});
							}
						}
					}

					// If no tool calls, we're done
					if (toolCalls.length === 0) break;

					// Execute tool calls and send follow-up request
					const toolOutputs: ResponseInput = [];
					for (const tc of toolCalls) {
						send("tool", tc.name);
						const result = executeTool(tc.name, tc.args);
						toolOutputs.push({
							type: "function_call_output",
							call_id: tc.callId,
							output: result,
						});
					}

					// Make follow-up request with tool results
					response = await client.responses.create({
						model: "gpt-4o",
						instructions,
						input: toolOutputs,
						tools,
						tool_choice: "auto",
						store: true,
						stream: true,
						previous_response_id: currentResponseId,
					});
				}

				send("response_id", currentResponseId);
				send("done", "");
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				send("error", errorMessage);
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
