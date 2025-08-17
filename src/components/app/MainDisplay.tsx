"use client";

import { useEffect, useState } from "react";
import { TimeEntry, TimeUser } from "../../models/time-user";
import TimeTable from "./TimeTable";
import ttp from "../../persistence/local-persistence";
import MainHeader from "./MainHeader";
import MainSidebar from "./MainSidebar";

export default function MainDisplay() {
  const [user, setUser] = useState<TimeUser>();
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    ttp.read().then((tu) => {
      if (tu) {
        setUser(tu);
        setEntries(tu.user.time.entries);
      } else
        setUser(
          new TimeUser({
            id: "1234",
            name: "Fooman",
            email: "Fooman@mail.com",
          })
        );
      //else reroute to user creation
    });
  }, []);

  function handleTimeEntryClick() {
    if (!user) return;

    const copy = user.copyState();
    const loe = user.getLatestOpenEntry();
    if (!loe) {
      copy.createTimeEntry();
    } else {
      copy.closeTimeEntry(loe.id);
    }

    setUser(copy);
    ttp.save(copy);
  }

  return (
    user && (
      <div className="h-dvh grid grid-cols-[16rem_1fr] grid-rows-[auto_1fr] bg-[var(--secondary-slate)] text-[var(--secondary-slate)]">
        <MainSidebar />
        <MainHeader
          handleClick={handleTimeEntryClick}
          user={user}
          filterEntries={() => {}}
        />
        <main className="overflow-y-auto p-6 ">
          <TimeTable entries={entries} />
        </main>
      </div>
    )
  );
}
