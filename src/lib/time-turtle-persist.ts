import { v4 as uuidv4 } from "uuid";
import { generateHmac, validateHmac } from "../service/hmac-service";
import { compress, decompress } from "../service/compression-service";
import { TimeTurtle } from "./time-turtle";

/* Persistence Type */
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
