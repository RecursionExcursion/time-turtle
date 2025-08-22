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