"use client";

import { WorkerPayload, WorkerResponse } from "./db.worker";

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

function awaitWorker<T>(w: Worker, payload: WorkerPayload): Promise<T> {
  return new Promise((resolve, reject) => {
    w.onmessage = (evt) => {
      const data = evt.data;
      if (data.type === "success") {
        resolve(data.data as T);
      } else if (data.type === "error") {
        reject(new Error(data.message));
      }
    };

    w.postMessage(payload);
  });
}

export const db = {
  init: async function () {
    const WASM_URL = new URL(
      "/sqlite/sqlite3.wasm",
      window.location.origin
    ).toString();
    return awaitWorker(getWorker(), { type: "init", payload: WASM_URL });
  },
  saveUser: async function (usr: User): Promise<boolean> {
    return awaitWorker<boolean>(getWorker(), {
      type: "saveUser",
      payload: usr,
    });
  },
  getAll: async function (): Promise<UserDTO[]> {
    return awaitWorker<UserDTO[]>(getWorker(), { type: "getUsers" });
  },
  getUser: async function (id: string): Promise<User> {
    return awaitWorker<User>(getWorker(), { type: "getUser", payload: id });
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
