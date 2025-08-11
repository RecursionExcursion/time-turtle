"use client";

import { useEffect, useState } from "react";
import { TimeUser } from "../../models/time-user";
import Button from "../ui/Button";
import TimeTable from "./TimeTable";
import ttp from "../../persistence/local-persistence";

export default function MainTimeDisplay() {
  const [user, setUser] = useState<TimeUser>();

  useEffect(() => {
    ttp.read().then((tu) => {
      if (tu) setUser(tu);
      else
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
      <div>
        <div className="flex flex-col">
          <span>
            {user.user.info.name} has {user.getOpenEntries().length} open
            entries
          </span>
          <span>
            {
              user.getEntriesAfter(Date.now() - 1000 * 60 * 60 * 24 * 7, {
                closed: true,
              }).length
            }{" "}
            entries this week
          </span>
          <span>
            {
              user.getEntriesAfter(Date.now() - 1000 * 60 * 60 * 24, {
                //   open: true,
              }).length
            }{" "}
            entries today
          </span>
        </div>
        <div>
          <Button onClick={handleTimeEntryClick}>
            {user.getOpenEntries().length ? "Clock Out" : "Clock In"}
          </Button>
        </div>
        <TimeTable entries={user.user.time.entries} />
      </div>
    )
  );
}
