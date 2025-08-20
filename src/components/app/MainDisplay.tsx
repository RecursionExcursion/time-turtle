"use client";

import TimeTable from "./TimeTable";
import MainSidebar from "./MainSidebar";
import { useAppContext } from "../../context/AppContext";

export default function MainDisplay() {
  const { user } = useAppContext();

  return (
    user && (
      <div className="h-dvh grid grid-cols-[16rem_1fr] grid-rows-[auto_1fr] bg-[var(--secondary-slate)] text-[var(--secondary-slate)]">
        <MainSidebar />
        <main className="overflow-y-auto p-6 ">
          <TimeTable entries={user.time.entries} />
        </main>
      </div>
    )
  );
}
