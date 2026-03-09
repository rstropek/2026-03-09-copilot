import path from "node:path";
import Database from "better-sqlite3";

const db = new Database(path.join(process.cwd(), "superfan.db"));

export default db;
