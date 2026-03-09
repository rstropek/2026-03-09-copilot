CREATE TABLE heroes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    real_name TEXT,
    first_appearance TEXT NOT NULL,
    super_powers TEXT NOT NULL DEFAULT '[]',
    coolness_factor INTEGER NOT NULL CHECK (coolness_factor >= 0 AND coolness_factor <= 5)
);
