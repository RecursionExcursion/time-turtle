import { v4 as uuidv4 } from "uuid";
// import { generateHmac, validateHmac } from "../service/hmac-service";

/* Data Shape */
export type TimeTurtleStruct = {
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

export interface TimeEntryValidator {
  generate: (te: TimeEntry) => Promise<string>;
  validate: (te: TimeEntry) => Promise<boolean>;
}
/* Default validator */
let validatorRef: TimeEntryValidator = {
  async generate(te) {
    return `${te.inTime}${te.outTime}`;
  },
  async validate(te) {
    return te.sig === `${te.inTime}${te.outTime}`;
  },
};

export class TimeTurtle {
  validator: TimeEntryValidator;
  tt: TimeTurtleStruct;

  constructor(props?: { tt?: TimeTurtleStruct }) {
    this.tt = props?.tt ?? { users: [] };

    if (!validatorRef) {
      throw new Error("Time Turtle is not initalized");
    }

    this.validator = validatorRef;
  }

  static init(validator: TimeEntryValidator) {
    validatorRef = validator;
  }
  static new = (): TimeTurtleStruct => ({ users: [] });
  static JSON = {
    to: (tt: TimeTurtle) => JSON.stringify(tt.tt),
    from: (jsn: string) => JSON.parse(jsn) as TimeTurtleStruct,
  };

  #addUser = (u: User) => this.tt.users.push(u);
  getUsers = () => this.tt.users;
  getUser = (uId: string) => this.tt.users.find((u) => u.info.id === uId);
  deleteUser = (uId: string) => {
    this.tt.users = this.tt.users.filter((u) => u.info.id === uId);
  };
  getUserIndex = (uId: string) => {
    const i = this.tt.users.findIndex((u) => u.info.id === uId);
    return {
      index: i,
      user: i >= 0 ? this.tt.users[i] : undefined,
    };
  };
  clone = (): TimeTurtle => {
    return new TimeTurtle({
      tt: structuredClone(this.tt),
    });
  };

  user = {
    /* create and add */
    register: (name: string, email: string): User => {
      const newUser = {
        info: {
          id: uuidv4(),
          name,
          email,
        },
        time: { flags: [], entries: [] },
      };
      this.#addUser(newUser);
      return newUser;
    },

    update: (usr: User): boolean => {
      const i = this.tt.users.findIndex((u) => u.info.id === usr.info.id);

      if (i === -1) {
        return false;
      }

      this.tt.users[i] = usr;
      return true;
    },

    createTimeEntry: async (
      uId: string,
      ...flags: string[]
    ): Promise<
      | {
          u: User;
          te: TimeEntry;
        }
      | undefined
    > => {
      const u = this.getUser(uId);

      if (!u) {
        return;
      }

      const te: TimeEntry = {
        id: uuidv4(),
        inTime: Date.now(),
        sig: "",
        flags,
      };

      //set validation sig
      te.sig = await this.validator.generate(te);

      u.time.entries.push(te);
      return { u, te };
    },

    closeTimeEntry: async (uId: string, id: string): Promise<boolean> => {
      const u = this.getUser(uId);

      if (!u) {
        return false;
      }

      const te = u.time.entries.find((e) => e.id === id);
      if (!te) return false;
      te.outTime = Date.now();
      //set validation sig
      te.sig = await this.validator.generate(te);
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

    clone: (u: User): User => structuredClone(u),
  };

  entry = {
    createValidationSig: async (te: TimeEntry) => this.validator.generate(te),
    validate: async (te: TimeEntry) => this.validator.validate(te),
  };
}
