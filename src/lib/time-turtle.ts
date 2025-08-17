import { v4 as uuidv4 } from "uuid";
import { generateHmac, validateHmac } from "../service/hmacService";
import { compress, decompress } from "../service/compressionService";

export type TimeTurtle = {
  users: User[];
};

export type User = {
  info: UserInfo;
  time: {
    flags: string[];
    entries: TimeEntry[];
  };
};
export type UserInfo = {
  id: string;
  name: string;
  email: string;
};
export type TimeEntry = {
  id: string;
  inTime: number;
  outTime?: number;
  flags: string[];
};

export type PersistenceBlob = {
  id: string;
  lastAccessed: number;
  hmac: string;
  data: string; //compressed payload
};

export interface Persister {
  save: (up: PersistenceBlob) => void;
  read: () => PersistenceBlob | undefined;
}

export class TimeTurtleRepo {
  constructor(private readonly persister: Persister) {}

  async read(): Promise<TimeTurtle | undefined> {
    const persistedUserData = this.persister.read();
    if (!persistedUserData) return;

    //validate hmac
    const ok = await validateHmac(
      persistedUserData.data,
      persistedUserData.hmac
    );
    if (!ok) throw Error("Data is invalid");

    //decompress
    return await decompress<TimeTurtle>(persistedUserData.data);
  }
  async save(tt: TimeTurtle) {
    //compress
    const compressedUserData = await compress(tt);
    //map
    const up: PersistenceBlob = {
      id: uuidv4(),
      lastAccessed: Date.now(),
      hmac: await generateHmac(compressedUserData),
      data: compressedUserData,
    };
    //save
    return this.persister.save(up);
  }
}

// export class TimeUser {
export const UserModel = {
  // userType: User;

  // constructor(usr: UserInfo) {
  //   this.userType = {
  //     info: usr,
  //     time: {
  //       flags: [],
  //       entries: [],
  //     },
  //   };
  // }
  create(info: User["info"]): User {
    return { info, time: { flags: [], entries: [] } };
  },

  // static fromType(ut: User) {
  //   const newUser = new TimeUser(ut.info);
  //   newUser.userType.time = ut.time;
  //   return newUser;
  // }

  createTimeEntry(
    u: User,
    ...flags: string[]
  ): {
    u: User;
    te: TimeEntry;
  } {
    const te: TimeEntry = {
      id: uuidv4(),
      inTime: Date.now(),
      flags,
    };
    u.time.entries.push(te);
    return { u, te };
  },

  closeTimeEntry(u: User, id: string): boolean {
    const te = u.time.entries.find((e) => e.id === id);
    if (!te) return false;
    te.outTime = Date.now();
    return true;
  },

  getOpenEntries(u: User): TimeEntry[] {
    return u.time.entries.filter((e) => !e.outTime);
  },

  getLatestOpenEntry(u: User) {
    return u.time.entries.findLast((e) => !e.outTime);
  },

  getLastEntry: (u: User) => u.time.entries.at(-1),

  getEntriesAfter(
    u: User,
    date: number,
    opts?: {
      closed?: boolean;
      open?: boolean;
      flags?: string[];
    }
  ) {
    const entriesAfter = u.time.entries
      .filter((e) => {
        return e.inTime > date || (e.outTime && e.outTime > date);
      })
      .filter((e) => {
        if (opts?.open) {
          return !e.outTime;
        }
        return e;
      })
      .filter((e) => {
        if (opts?.closed) {
          return e.outTime;
        }
        return e;
      })
      .filter((e) => {
        if (opts?.flags) {
          return opts.flags.some((flag) => e.flags.includes(flag));
        }
        return e;
      });
    return entriesAfter;
  },

  cloneUser: (u: User): User => structuredClone(u),
};
