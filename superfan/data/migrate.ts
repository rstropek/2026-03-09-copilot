import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";

export function runMigrations(db: Database.Database) {
	db.exec(`
		CREATE TABLE IF NOT EXISTS _migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			applied_at TEXT NOT NULL DEFAULT (datetime('now'))
		)
	`);

	const migrationsDir = path.join(process.cwd(), "migrations");
	if (!fs.existsSync(migrationsDir)) return;

	const files = fs
		.readdirSync(migrationsDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	const applied = new Set(
		db
			.prepare("SELECT name FROM _migrations")
			.all()
			.map((row) => (row as { name: string }).name),
	);

	for (const file of files) {
		if (applied.has(file)) continue;

		const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
		const migrate = db.transaction(() => {
			db.exec(sql);
			db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
		});
		migrate();
	}
}
