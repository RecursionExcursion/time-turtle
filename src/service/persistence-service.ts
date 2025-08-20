import { v4 as uuidv4 } from "uuid";
import { generateHmac, validateHmac } from "./hmac-service";
import { compress, decompress } from "./compression-service";
import { TimeTurtleStruct } from "../lib/time-turtle";

export interface Persister {
  save: (up: PersistenceBlob) => void;
  read: () => PersistenceBlob | undefined;
}

/* Persistence Type */
export type PersistenceBlob = {
  id: string;
  lastAccessed: number;
  hmac: string;
  data: string; //compressed payload
};

export class TimeTurtleRepo {
  constructor(private readonly persister: Persister) {}

  async read(): Promise<TimeTurtleStruct | undefined> {
    const persistedUserData = this.persister.read();
    if (!persistedUserData) return;

    //validate hmac
    const ok = await validateHmac(
      persistedUserData.data,
      persistedUserData.hmac
    );
    if (!ok) throw Error("Data is invalid");

    //decompress
    return await decompress<TimeTurtleStruct>(persistedUserData.data);
  }
  async save(tt: TimeTurtleStruct) {
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
