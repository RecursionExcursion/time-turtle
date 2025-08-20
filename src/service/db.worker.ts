/* eslint-disable @typescript-eslint/no-explicit-any */
import sqlite3InitModule, { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import { TimeEntry, User, UserDTO } from "./db";

type Err = { type: "error"; message: string };

let db: OpfsDatabase;

self.onmessage = async (
  evt: MessageEvent<{ type: string; payload: unknown }>
) => {
  console.log(evt.data);

  try {
    switch (evt.data.type) {
      case "init": {
        console.log("Initing");
        if (typeof evt.data.payload !== "string") {
          throw new Error("Invalid payload");
        }

        if (!db) {
          db = await connect(evt.data.payload as string);
        }
        console.log({ db });

        self.postMessage({ type: "ready" });
        break;
      }
      case "save": {
        console.log("Saving");
        const { payload: usr } = evt.data;
        await clientSQL.saveUser(usr as User);
        self.postMessage({ type: "success" });
        break;
      }
      case "getAll": {
        console.log("Getting All");
        const res = await clientSQL.getAllUsers();
        self.postMessage({ type: "success", res: res });
        break;
      }
      case "getUser": {
        console.log("Getting User");
        const { payload: id } = evt.data;
        const res = await clientSQL.getUser(id as string);
        self.postMessage({ type: "success", res: res });
        break;
      }
      default: {
        throw new Error("Invalid message type");
      }
    }
  } catch (e: any) {
    console.log("Error in worker: " + e);
    self.postMessage({
      type: "error",
      message: e?.message ?? String(e),
    } as Err);
  }
};

async function connect(url: string) {
  const sqlite3 = await sqlite3InitModule({
    locateFile: (f: string) => (f === "sqlite3.wasm" ? url : f),
  });

  const O = sqlite3.oo1;
  // const opfsEnabled = !!sqlite3?.opfs?.opfsEnabled;
  const hasOpfsDb = !!O?.OpfsDb;

  console.log("has navigator.storage?", !!self.navigator?.storage);
  console.log("has getDirectory?", !!self.navigator?.storage?.getDirectory);
  console.log(
    "vfs opfs registered?",
    !!sqlite3?.capi?.sqlite3_vfs_find?.("opfs")
  );
  console.log("worker COI:", self.crossOriginIsolated);
  // 🔎 diagnostics to your DevTools console
  console.log("sqlite diagnostics:", {
    // opfsEnabled,
    hasOpfsDb,
    hasOO1: !!O,
    runtime: self.location.href,
  });
  const db = new O.OpfsDb("timeturtle.sqlite");
  setUpTables(db);
  return db;
}

function setUpTables(db: OpfsDatabase) {
  db.exec(`
PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  flags_json  TEXT NOT NULL DEFAULT '[]'   -- stores user.time.flags
);

CREATE TABLE IF NOT EXISTS time_entries (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  in_time      INTEGER NOT NULL,
  out_time     INTEGER,
  sig          TEXT NOT NULL,
  flags_json   TEXT NOT NULL DEFAULT '[]', -- stores entry.flags
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_user_time ON time_entries(user_id, in_time);
  `);
}

const clientSQL = {
  saveUser: async (user: User) => {
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
  getUser: async (userId: string): Promise<User | null> => {
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
  getAllUsers: async (): Promise<UserDTO[]> => {
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
  /*     // Export the SQLite file as a download
    exportDb: async (filename = "timeturtle.sqlite") => {
      const db = await openDB();
      db.checkpoint?.(); // flush WAL if available

      // Get OPFS handle for our file
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle("timeturtle.sqlite");
      const file = await handle.getFile();

      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    // Import a .sqlite file (replace current DB)
    // Caller should ensure no concurrent DB usage during import.
    importDb: async (pickedFile: File) => {
      // Close the current DB if your app holds one open.
      // In this simple module, we rely on SQLite closing on GC; for safety, reload page after import.

      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle("timeturtle.sqlite", {
        create: true,
      });
      const writable = await handle.createWritable();
      await pickedFile.stream().pipeTo(writable);
    }, */
};
