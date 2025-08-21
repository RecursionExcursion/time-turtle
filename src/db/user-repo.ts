import { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import { TimeEntry, User, UserDTO } from "./db";

interface IUserRepo {
  getUser: (db: OpfsDatabase, userId: string) => Promise<User | null>;
  getUsers: (db: OpfsDatabase) => Promise<UserDTO[]>;
  saveUser: (db: OpfsDatabase, usr: User) => Promise<void>;
}

export type UserRepoMethod = keyof typeof userRepo;

export const userRepo: IUserRepo = {
  getUser: async (db: OpfsDatabase, userId: string) => {
    if (!db) throw new Error("Db not initalized");

    const uStmt = db.prepare(`
    SELECT id, name, email, flags_json
    FROM users 
    WHERE id = ?
  `);
    uStmt.bind([userId]);
    if (!uStmt.step()) {
      uStmt.finalize();
      return null;
    }
    const id = uStmt.get(0) as string;
    const name = uStmt.get(1) as string;
    const email = uStmt.get(2) as string;
    const userFlagsJson = (uStmt.get(3) as string) ?? "[]";
    uStmt.finalize();

    const eStmt = db.prepare(`
    SELECT id, in_time, out_time, sig, flags_json
    FROM time_entries
    WHERE user_id = ?
    ORDER BY in_time DESC
  `);
    eStmt.bind([id]);

    const entries: TimeEntry[] = [];
    while (eStmt.step()) {
      const eid = eStmt.get(0) as string;
      const inTime = eStmt.get(1) as number;
      const outTimeRaw = eStmt.get(2) as number | null;
      const sig = eStmt.get(3) as string;
      const entryFlagsJson = (eStmt.get(4) as string) ?? "[]";

      entries.push({
        id: eid,
        inTime,
        outTime: outTimeRaw ?? undefined,
        sig,
        flags: JSON.parse(entryFlagsJson),
      });
    }
    eStmt.finalize();

    return {
      info: { id, name, email },
      time: {
        flags: JSON.parse(userFlagsJson),
        entries,
      },
    };
  },

  getUsers: async (db: OpfsDatabase) => {
    if (!db) throw new Error("Db not initalized");

    const stmt = db.prepare(`SELECT id, name FROM users ORDER BY name`);
    const users: { id: string; name: string }[] = [];

    while (stmt.step()) {
      const id = stmt.get(0) as string;
      const name = stmt.get(1) as string;
      users.push({ id, name });
    }
    stmt.finalize();

    return users;
  },

  saveUser: async (db: OpfsDatabase, user: User) => {
    if (!db) throw new Error("Db not initalized");

    const upsertUser = db.prepare(`
                INSERT INTO users(id,name,email,flags_json)
                VALUES(?,?,?,?)
                ON CONFLICT(id) DO UPDATE SET 
                name = excluded.name,
                email = excluded.email,
                flags_json = excluded.flags_json
                `);

    const upsertEntry = db.prepare(`
    INSERT INTO time_entries(id, user_id, in_time, out_time, sig, flags_json)
    VALUES(?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      user_id    = excluded.user_id,
      in_time    = excluded.in_time,
      out_time   = excluded.out_time,
      sig        = excluded.sig,
      flags_json = excluded.flags_json
  `);

    db.exec("BEGIN");
    try {
      upsertUser
        .bind([
          user.info.id,
          user.info.name,
          user.info.email,
          JSON.stringify(user.time.flags ?? []),
        ])
        .stepReset();

      for (const e of user.time.entries) {
        upsertEntry
          .bind([
            e.id,
            user.info.id,
            e.inTime,
            e.outTime ?? null,
            e.sig,
            JSON.stringify(e.flags ?? []),
          ])
          .stepReset();
      }

      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    } finally {
      upsertUser.finalize();
      upsertEntry.finalize();
    }
  },
};
