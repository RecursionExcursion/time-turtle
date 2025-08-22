import { TimeEntry } from "../types/time-turtle";
import { generateHmac, validateHmac } from "./hmac-service";

export interface TimeEntryValidator {
  generate: (te: TimeEntry) => Promise<string>;
  validate: (te: TimeEntry) => Promise<boolean>;
}

export const timeValidator: TimeEntryValidator = {
  async generate(te) {
    return await generateHmac(
      JSON.stringify({
        in: te.inTime,
        out: te.outTime,
      })
    );
  },
  async validate(te) {
    return await validateHmac(
      JSON.stringify({
        in: te.inTime,
        out: te.outTime,
      }),
      te.sig
    );
  },
};
