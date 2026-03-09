import path from "node:path";
import Database from "better-sqlite3";
import { runMigrations } from "./migrate";

const db = new Database(path.join(process.cwd(), "superfan.db"));
runMigrations(db);

export default db;
