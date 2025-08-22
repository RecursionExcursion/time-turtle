import { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import { crudQueries } from "./sql-queries";
import { TimeEntry, User, UserDTO } from "../types/time-turtle";

interface IUserRepo {
  getUser: (db: OpfsDatabase, userId: string) => Promise<User | null>;
  getUsers: (db: OpfsDatabase) => Promise<UserDTO[]>;
  saveUser: (db: OpfsDatabase, usr: User) => Promise<void>;
  saveTimeEntry: (
    db: OpfsDatabase,
    te: TimeEntry,
    userId: string
  ) => Promise<void>;
  deleteUser: (db: OpfsDatabase, userId: string) => Promise<void>;
}

export type UserRepoMethod = keyof typeof userRepo;

export const userRepo: IUserRepo = {
  getUser,
  getUsers,
  saveUser,
  saveTimeEntry,
  deleteUser,
};

async function getUser(db: OpfsDatabase, userId: string) {
  if (!db) throw new Error("Db not initalized");

  const uStmt = db.prepare(crudQueries.get.user);
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

  const eStmt = db.prepare(crudQueries.get.timeEntry);
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
}

async function getUsers(db: OpfsDatabase) {
  if (!db) throw new Error("Db not initalized");

  const stmt = db.prepare(crudQueries.get.allUsers);
  const users: { id: string; name: string }[] = [];

  while (stmt.step()) {
    const id = stmt.get(0) as string;
    const name = stmt.get(1) as string;
    users.push({ id, name });
  }
  stmt.finalize();

  return users;
}

async function saveUser(db: OpfsDatabase, user: User) {
  if (!db) throw new Error("Db not initalized");

  const upsertUser = db.prepare(crudQueries.save.user);

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

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  } finally {
    upsertUser.finalize();
  }
}

async function saveTimeEntry(db: OpfsDatabase, te: TimeEntry, userId: string) {
  if (!db) throw new Error("Db not initalized");

  const upsertEntry = db.prepare(crudQueries.save.timeEntry);

  db.exec("BEGIN");
  try {
    upsertEntry
      .bind([
        te.id,
        userId,
        te.inTime,
        te.outTime ?? null,
        te.sig,
        JSON.stringify(te.flags ?? []),
      ])
      .stepReset();
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  } finally {
    upsertEntry.finalize();
  }
}

async function deleteUser(db: OpfsDatabase, userId: string) {
  if (!db) throw new Error("Db not initalized");
  const deleteEntry = db.prepare(crudQueries.delete.user);
  db.exec("BEGIN IMMEDIATE");
  try {
    deleteEntry.bind([userId]).stepReset();
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  } finally {
    deleteEntry.finalize();
  }
}
