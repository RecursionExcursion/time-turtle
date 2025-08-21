/* eslint-disable @typescript-eslint/no-explicit-any */
import sqlite3InitModule, { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import { User } from "./db";
import { userRepo, UserRepoMethod } from "./user-repo";

type Err = { type: "error"; message: string };

let db: OpfsDatabase;

type EventKeys = UserRepoMethod | "init";

export type WorkerPayload = { type: EventKeys; payload?: unknown };
export type ResponseKey = "success" | "fail" | "error";
export type WorkerResponse = { type: ResponseKey; data?: any };

self.onmessage = async (evt: MessageEvent<WorkerPayload>) => {
  const post = (res: WorkerResponse) => {
    self.postMessage(res);
    return;
  };

  try {
    switch (evt.data.type) {
      case "init": {
        if (typeof evt.data.payload !== "string") {
          throw new Error("Invalid payload");
        }

        if (!db) {
          db = await connect(evt.data.payload as string);
        }

        post({ type: "success" });
      }
      case "saveUser": {
        const { payload: usr } = evt.data;
        await userRepo.saveUser(db, usr as User);
        self.postMessage({ type: "success" });
      }
      case "getUsers": {
        const res = await userRepo.getUsers(db);
        post({ type: "success", data: res });
      }
      case "getUser": {
        const { payload: id } = evt.data;
        const res = await userRepo.getUser(db, id as string);
        self.postMessage({ type: "success", data: res });
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
  const db = new sqlite3.oo1.OpfsDb("timeturtle.sqlite");
  createIfNoTables(db);
  return db;
}

function createIfNoTables(db: OpfsDatabase) {
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
