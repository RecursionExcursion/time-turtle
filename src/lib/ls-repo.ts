import { Persister, PersistenceBlob } from "./time-turtle";

type NewType = Persister;

export class LS_Repo implements NewType {
  #key = "tt_data";

  save(up: PersistenceBlob) {
    localStorage.setItem(this.#key, JSON.stringify(up));
  }
  read() {
    const item = localStorage.getItem(this.#key);
    if (item) {
      return JSON.parse(item) as PersistenceBlob;
    }
  }
}
