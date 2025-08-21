"use client";

export type User = {
  info: UserInfo;
  time: { flags: string[]; entries: TimeEntry[] };
};
export type UserDTO = { id: string; name: string };

export type UserInfo = { id: string; name: string; email: string };

export type TimeEntry = {
  id: string;
  inTime: number;
  outTime?: number;
  sig: string;
  flags: string[];
};

let workerInstance: Worker | undefined;

function getWorker() {
  if (!workerInstance) {
    workerInstance = new Worker(new URL("./db.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return workerInstance;
}

export const db = {
  init: async function () {
    const worker = getWorker();
    const wasmUrl = new URL(
      "/sqlite/sqlite3.wasm",
      window.location.origin
    ).toString();
    return new Promise((resolve, reject) => {
      worker.onmessage = (evt) => {
        const data = evt.data;
        if (data.type === "success") {
          resolve(worker);
        } else if (data.type === "error") {
          reject(new Error(data.message));
        }
      };

      worker.postMessage({ type: "init", payload: wasmUrl }); // use wasmUrl (not payload)
    });
  },
  saveUser: async function (usr: User): Promise<boolean> {
    const worker = getWorker();
    return new Promise((resolve, reject) => {
      worker.onmessage = (evt) => {
        const data = evt.data;
        if (data.type === "success") {
          resolve(true);
        } else if (data.type === "error") {
          reject(false);
        }
      };
      worker.postMessage({ type: "saveUser", payload: usr });
    });
  },
  getAll: async function (): Promise<UserDTO[]> {
    const worker = getWorker();
    return new Promise((resolve, reject) => {
      worker.onmessage = (evt) => {
        const data = evt.data;
        // console.log({ users: evt.data });
        // console.log({ data });
        if (data.type === "success") {
          resolve(data.data);
        } else if (data.type === "error") {
          reject([]);
        }
      };
      worker.postMessage({ type: "getUsers" });
    });
  },
  getUser: async function (id: string): Promise<User> {
    const worker = getWorker();
    return new Promise((resolve, reject) => {
      worker.onmessage = (evt) => {
        const data = evt.data;
        if (data.type === "success") {
          resolve(data.data);
        } else if (data.type === "error") {
          reject([]);
        }
      };
      worker.postMessage({ type: "getUser", payload: id });
    });
  },
};

// export async function openDB() {
//   //   console.log({
//   //     opfsEnabled: sqlite3?.oo1,
//   //     hasOpfsDb: !!sqlite3?.oo1?.OpfsDb,
//   //   });
//   //   if (db) return db;
//   //   // Ask the browser not to evict our storage if possible
//   //   try {
//   //     await navigator.storage.persist?.();
//   //   } catch {}
//   //   sqlite3 = await sqlite3InitModule(); // loads WASM
//   //   // Single-file DB living in OPFS:
//   //   db = new sqlite3.oo1.OpfsDb("timeturtle.sqlite");
//   //   db.exec(`
//   // PRAGMA foreign_keys=ON;
//   // PRAGMA journal_mode=WAL;
//   // CREATE TABLE IF NOT EXISTS users (
//   //   id          TEXT PRIMARY KEY,
//   //   name        TEXT NOT NULL,
//   //   email       TEXT NOT NULL,
//   //   flags_json  TEXT NOT NULL DEFAULT '[]'   -- stores user.time.flags
//   // );
//   // CREATE TABLE IF NOT EXISTS time_entries (
//   //   id           TEXT PRIMARY KEY,
//   //   user_id      TEXT NOT NULL,
//   //   in_time      INTEGER NOT NULL,
//   //   out_time     INTEGER,
//   //   sig          TEXT NOT NULL,
//   //   flags_json   TEXT NOT NULL DEFAULT '[]', -- stores entry.flags
//   //   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//   // );
//   // CREATE INDEX IF NOT EXISTS idx_entries_user_time ON time_entries(user_id, in_time);
//   //   `);
//   //   return db;
// }
