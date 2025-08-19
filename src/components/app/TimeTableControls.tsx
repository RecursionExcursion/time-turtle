"use client";

import { useAppContext } from "../../app/context/AppContext";
import { TimeTurtleModel } from "../../lib/time-turtle";

export default function TimeTableControls() {
  const { user, saveUser } = useAppContext();

  async function handleTimeEntryClick() {
    if (!user) return;

    const copy = TimeTurtleModel.user.cloneUser(user);
    const loe = TimeTurtleModel.user.getLatestOpenEntry(user);
    if (!loe) {
      await TimeTurtleModel.user.createTimeEntry(copy);
    } else {
      await TimeTurtleModel.user.closeTimeEntry(copy, loe.id);
    }
    saveUser(copy);
  }

  return (
    <div>
      <button
        className="cursor-pointer border border-white"
        onClick={handleTimeEntryClick}
      >
        Punch
      </button>
    </div>
  );
}
