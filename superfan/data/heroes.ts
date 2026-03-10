import type { CreateHeroInput, Hero } from "../types/hero";
import db from "./db";

interface HeroRow {
	id: number;
	name: string;
	real_name: string | null;
	first_appearance: string;
	super_powers: string;
	coolness_factor: number;
}

function rowToHero(row: HeroRow): Hero {
	return {
		...row,
		super_powers: JSON.parse(row.super_powers),
	};
}

export function getAllHeroes(): Hero[] {
	const rows = db
		.prepare("SELECT * FROM heroes ORDER BY id DESC")
		.all() as HeroRow[];
	return rows.map(rowToHero);
}

export function createHero(input: CreateHeroInput): Hero {
	const stmt = db.prepare(`
		INSERT INTO heroes (name, real_name, first_appearance, super_powers, coolness_factor)
		VALUES (?, ?, ?, ?, ?)
	`);

	const result = stmt.run(
		input.name,
		input.real_name,
		input.first_appearance,
		JSON.stringify(input.super_powers),
		input.coolness_factor,
	);

	const row = db
		.prepare("SELECT * FROM heroes WHERE id = ?")
		.get(result.lastInsertRowid) as HeroRow;

	return rowToHero(row);
}
