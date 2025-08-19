import { v4 as uuidv4 } from "uuid";
import { generateHmac, validateHmac } from "../service/hmac-service";

/* Data Shape */
export type TimeTurtle = {
  users: User[];
};

/* User Types */
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
  sig: string;
  flags: string[];
};

export const TimeTurtleModel = {
  user: {
    create(name: string, email: string): User {
      return {
        info: {
          id: uuidv4(),
          name,
          email,
        },
        time: { flags: [], entries: [] },
      };
    },

    createTimeEntry: async (
      u: User,
      ...flags: string[]
    ): Promise<{
      u: User;
      te: TimeEntry;
    }> => {
      const te: TimeEntry = {
        id: uuidv4(),
        inTime: Date.now(),
        sig: "",
        flags,
      };

      //set validation sig
      te.sig = await createTimeEntrySignature(te);

      u.time.entries.push(te);
      return { u, te };
    },

    closeTimeEntry: async function (u: User, id: string): Promise<boolean> {
      const te = u.time.entries.find((e) => e.id === id);
      if (!te) return false;
      te.outTime = Date.now();
      //set validation sig
      te.sig = await createTimeEntrySignature(te);
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
  },

  entry: {
    createValidationSig: async (te: TimeEntry) => createTimeEntrySignature(te),
    validate: async (te: TimeEntry) => validateEntry(te),
  },

  time: {
    create: (): TimeTurtle => ({ users: [] }),
    addUser: (u: User, tt: TimeTurtle) => tt.users.push(u),
    deleteUser: (uId: string, tt: TimeTurtle) => {
      tt.users = tt.users.filter((u) => u.info.id === uId);
    },
    getUser: (uId: string, tt: TimeTurtle) =>
      tt.users.find((u) => u.info.id === uId),
    clone: (tt: TimeTurtle) => structuredClone(tt),
  },
};

async function validateEntry(te: TimeEntry) {
  return await validateHmac(
    JSON.stringify({
      in: te.inTime,
      out: te.outTime,
    }),
    te.sig
  );
}

async function createTimeEntrySignature(te: TimeEntry) {
  return await generateHmac(
    JSON.stringify({
      in: te.inTime,
      out: te.outTime,
    })
  );
}
