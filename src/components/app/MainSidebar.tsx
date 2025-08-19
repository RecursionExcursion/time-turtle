"use client";

import MenuAnchor from "../ui/MenuAnchor";
import DateRangeSelector from "./DateRangeSelector";
import TimeTableControls from "./TimeTableControls";

export default function MainSidebar() {
  // const {} = useModal({ id: "modal" });

  return (
    <aside className="col-[1] row-[1/3] bg-[var(--primary-slate)] text-slate-100 p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[var(--primary-purple)]W">
        Time Turtle
      </h1>
      <nav className="flex flex-col gap-2">
        <MenuAnchor href="#">Dashboard</MenuAnchor>
        <MenuAnchor href="#">Projects</MenuAnchor>
        <MenuAnchor href="#">Reports</MenuAnchor>
        <MenuAnchor href="#">Settings</MenuAnchor>
      </nav>
      <TimeTableControls  />
      <DateRangeSelector modalId="modal-root" />
    </aside>
  );
}
