import { NextResponse } from "next/server";
import { createHero } from "../../../data/heroes";

export async function POST(request: Request) {
	const body = await request.json();

	const { name, real_name, first_appearance, super_powers, coolness_factor } =
		body;

	if (!name || typeof name !== "string") {
		return NextResponse.json({ error: "name is required" }, { status: 400 });
	}

	if (!first_appearance || typeof first_appearance !== "string") {
		return NextResponse.json(
			{ error: "first_appearance is required" },
			{ status: 400 },
		);
	}

	if (
		typeof coolness_factor !== "number" ||
		coolness_factor < 0 ||
		coolness_factor > 5
	) {
		return NextResponse.json(
			{ error: "coolness_factor must be a number between 0 and 5" },
			{ status: 400 },
		);
	}

	const hero = createHero({
		name,
		real_name: real_name || null,
		first_appearance,
		super_powers: Array.isArray(super_powers) ? super_powers : [],
		coolness_factor,
	});

	return NextResponse.json(hero, { status: 201 });
}
