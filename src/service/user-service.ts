import { v4 as uuidv4 } from "uuid";
import { User } from "../types/time-turtle";
export function createNewUser(name: string, email: string): User {
  return {
    info: {
      id: uuidv4(),
      name,
      email,
    },
    time: { flags: [], entries: [] },
  };
}

export function getLastOpenEntry(u: User) {
  return u.time.entries.findLast((e) => !e.outTime);
}
