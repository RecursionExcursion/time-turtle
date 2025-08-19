"use client";

import { useAppContext } from "../../app/context/AppContext";
import { UserModel } from "../../lib/time-turtle";

export default function TimeTableControls() {
  const { user, saveUser } = useAppContext();

  async function handleTimeEntryClick() {
    if (!user) return;

    const copy = UserModel.cloneUser(user);
    const loe = UserModel.getLatestOpenEntry(user);
    if (!loe) {
      await UserModel.createTimeEntry(copy);
    } else {
      await UserModel.closeTimeEntry(copy, loe.id);
    }
    saveUser(copy);
  }

  return (
    <div>
      <button className="cursor-pointer border border-white" onClick={handleTimeEntryClick}>Punch</button>
    </div>
  );
}
