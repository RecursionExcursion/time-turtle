import { v4 as uuidv4 } from "uuid";
import { TimeEntry } from "../types/time-turtle";
import { timeValidator } from "./time-entry-validation-service";

export async function createTimeEntry(
  time?: number,
  ...flags: string[]
): Promise<TimeEntry> {
  const te = {
    id: uuidv4(),
    inTime: time ?? Date.now(),
    sig: "",
    flags,
  };
  te.sig = await timeValidator.generate(te);
  return te;
}

export async function closeTimeEntry(
  te: TimeEntry,
  time?: number
): Promise<TimeEntry> {
  te.outTime = time ?? Date.now();
  te.sig = await timeValidator.generate(te);
  return te;
}
