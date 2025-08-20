import { TimeEntryValidator } from "../lib/time-turtle";
import { generateHmac, validateHmac } from "./hmac-service";

export const validator: TimeEntryValidator = {
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
