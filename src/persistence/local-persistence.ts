// "use client";

// import { TimeUser, UserType } from "../models/time-user";
// import { UserPersistence } from "../models/user-persistence-type";
// import { compress, decompress } from "../service/compressionService";
// import { generateHmac, validateHmac } from "../service/hmacService";
// import { v4 as uuidv4 } from "uuid";

// interface Persister {
//   save: (up: UserPersistence) => void;
//   read: () => UserPersistence | undefined;
// }

// export class TimeTurtlePersistence {
//   repo: Persister = new LS_Repo();
//   async read() {
//     const persistedUserData = this.repo.read();
//     if (!persistedUserData) return;

//     //validate hmac
//     const ok = await validateHmac(
//       persistedUserData.data,
//       persistedUserData.hmac
//     );
//     if (!ok) {
//       //TODO
//       throw Error("Invalide data");
//     }
//     //decompress
//     const ut = await decompress<UserType>(persistedUserData.data);
//     //map back into obj
//     return TimeUser.fromType(ut);
//   }
//   async save(tu: TimeUser) {
//     //compress
//     const compressedUserData = await compress(tu.user);
//     //map
//     const up: UserPersistence = {
//       id: uuidv4(),
//       lastAccessed: Date.now(),
//       hmac: await generateHmac(compressedUserData),
//       data: compressedUserData,
//     };
//     //save
//     return this.repo.save(up);
//   }
// }

// class LS_Repo implements Persister {
//   #key = "tt_data";

//   save(up: UserPersistence) {
//     localStorage.setItem(this.#key, JSON.stringify(up));
//   }
//   read() {
//     const item = localStorage.getItem(this.#key);
//     if (item) {
//       return JSON.parse(item) as UserPersistence;
//     }
//   }
// }

// const ttp = new TimeTurtlePersistence();
// export default ttp;
