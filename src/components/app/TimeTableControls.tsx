"use client";

import { useAppContext } from "../../context/AppContext";

export default function TimeTableControls() {
  const { punch } = useAppContext();

  return (
    <button className="cursor-pointer border border-white" onClick={punch}>
      Punch
    </button>
  );
}
