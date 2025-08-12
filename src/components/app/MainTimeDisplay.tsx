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
      <div className="h-dvh grid grid-cols-[16rem_1fr] grid-rows-[auto_1fr] bg-slate-800 text-slate-800">
        {/* Sidebar: left column, full height */}
        <aside className="col-[1] row-[1/3] bg-slate-900 text-slate-100 p-4 flex flex-col gap-4">
          <div className="text-lg font-semibold">Dashboard</div>
          <nav className="flex flex-col gap-2">
            <a className="rounded-xl px-3 py-2 hover:bg-slate-800" href="#">
              Dashboard
            </a>
            <a className="rounded-xl px-3 py-2 hover:bg-slate-800" href="#">
              Projects
            </a>
            <a className="rounded-xl px-3 py-2 hover:bg-slate-800" href="#">
              Reports
            </a>
            <a className="rounded-xl px-3 py-2 hover:bg-slate-800" href="#">
              Settings
            </a>
          </nav>
        </aside>

        <header className="col-[2] row-[1] bg-slate-300 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--primary-purple)]">
            Time Turtle
          </h1>
          <div className="flex items-center gap-3">
            <Button onClick={handleTimeEntryClick}>
              {user.getOpenEntries().length ? "Clock Out" : "Clock In"}
            </Button>
          </div>
        </header>

        <main className="overflow-y-auto p-6 ">
          <TimeTable entries={user.user.time.entries} />
        </main>
      </div>
    )
  );
}
