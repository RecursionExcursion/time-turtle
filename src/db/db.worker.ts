/* eslint-disable @typescript-eslint/no-explicit-any */
import sqlite3InitModule, { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import { userRepo, UserRepoMethod } from "./user-repo";
import {
  createTimeEntryTable,
  createUserTable,
  indexes,
  pragmas,
} from "./sql-queries";
import { TimeEntry, User } from "../types/time-turtle";

const dbName = "timeturtle.sqlite";

let db: OpfsDatabase;

type EventKeys = UserRepoMethod | "init";

export type WorkerPayload = { type: EventKeys; payload?: unknown };
export type ResponseKey = "success" | "fail" | "error";
export type WorkerResponse = { type: ResponseKey; data?: any };
type WorkerErr = { type: "error"; message: string };

const workerActions: Record<EventKeys, any> = {
  init: async (url: string) => {
    if (!db) db = await connect(url);
  },
  saveUser: async (usr: User): Promise<void> =>
    await userRepo.saveUser(db, usr as User),
  getUser: async (id: string): Promise<User | null> =>
    await userRepo.getUser(db, id as string),
  getUsers: async () => await userRepo.getUsers(db),
  saveTimeEntry: async (params: { te: TimeEntry; userId: string }) =>
    await userRepo.saveTimeEntry(db, params.te, params.userId),
  deleteUser: async (userId: string) => await userRepo.deleteUser(db, userId),
};

self.onmessage = async (evt: MessageEvent<WorkerPayload>) => {
  try {
    const res = await workerActions[evt.data.type](evt.data.payload);
    self.postMessage({ type: "success", data: res } as WorkerResponse);
  } catch (e: any) {
    console.log("Error in worker: " + e);
    self.postMessage({
      type: "error",
      message: e?.message ?? String(e),
    } as WorkerErr);
  }
};

async function connect(url: string) {
  const sqlite3 = await sqlite3InitModule({
    locateFile: (f: string) => (f === "sqlite3.wasm" ? url : f),
  });
  const db = new sqlite3.oo1.OpfsDb(dbName);
  /* create table */
  db.exec(
    [
      pragmas,
      createUserTable,
      createTimeEntryTable,
      indexes.userTimeIndex,
    ].join("\n")
  );
  return db;
}

//TODO
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
