/* Table creation */
export const pragmas = `
PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
`;

export const createUserTable = `CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  flags_json  TEXT NOT NULL DEFAULT '[]'   -- stores user.time.flags
);
`;

export const createTimeEntryTable = `
CREATE TABLE IF NOT EXISTS time_entries (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  in_time      INTEGER NOT NULL,
  out_time     INTEGER,
  sig          TEXT NOT NULL,
  flags_json   TEXT NOT NULL DEFAULT '[]', -- stores entry.flags
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

export const indexes = {
  userTimeIndex: `CREATE INDEX IF NOT EXISTS idx_entries_user_time ON time_entries(user_id, in_time);`,
};

export const crudQueries = {
  save: {
    user: `
        INSERT INTO users(id,name,email,flags_json)
        VALUES(?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET 
        name = excluded.name,
        email = excluded.email,
        flags_json = excluded.flags_json
        `,

    timeEntry: `
        INSERT INTO time_entries(id, user_id, in_time, out_time, sig, flags_json)
        VALUES(?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          in_time    = excluded.in_time,
          out_time   = excluded.out_time,
          sig        = excluded.sig,
          flags_json = excluded.flags_json
        WHERE time_entries.user_id = excluded.user_id;
        `,
  },

  get: {
    allUsers: `SELECT id, name FROM users ORDER BY name`,
    user: `
    SELECT id, name, email, flags_json
    FROM users 
    WHERE id = ?
  `,
    timeEntry: `
    SELECT id, in_time, out_time, sig, flags_json
    FROM time_entries
    WHERE user_id = ?
    ORDER BY in_time DESC
  `,
  },

  delete: {
    user: `DELETE FROM users WHERE id = ?;`,
  },
};
