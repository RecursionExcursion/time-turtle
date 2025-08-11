import { v4 as uuidv4 } from "uuid";

export type UserType = {
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

export class TimeUser {
  user: UserType;

  constructor(usr: UserInfo) {
    this.user = {
      info: usr,
      time: {
        flags: [],
        entries: [],
      },
    };
  }

  static fromType(ut: UserType) {
    const newUser = new TimeUser(ut.info);
    newUser.user.time = ut.time;
    return newUser;
  }

  createTimeEntry(...flags: string[]) {
    const te: TimeEntry = {
      id: uuidv4(),
      inTime: Date.now(),
      flags,
    };
    this.user.time.entries.push(te);
    return te;
  }

  closeTimeEntry(id: string) {
    const te = this.user.time.entries.find((e) => e.id === id);
    if (!te) return false;
    te.outTime = Date.now();
    return true;
  }

  getOpenEntries() {
    return this.user.time.entries.filter((e) => !e.outTime);
  }

  getLatestOpenEntry() {
    return this.user.time.entries.findLast((e) => !e.outTime);
  }

  getLastEntry() {
    return this.user.time.entries.at(-1);
  }

  getEntriesAfter(
    date: number,
    opts?: {
      closed?: boolean;
      open?: boolean;
      flags?: string[];
    }
  ) {
    const entriesAfter = this.user.time.entries
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
  }

  copyState(): TimeUser {
    return TimeUser.fromType(structuredClone(this.user));
  }
}
