import { PersistenceBlob, Persister, TimeTurtleRepo } from "./persistence-service";

class LS_Persistence implements Persister {
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

const localRepo = new TimeTurtleRepo(new LS_Persistence());
export default localRepo;