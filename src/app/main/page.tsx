"use client";

import MainDisplay from "../../components/app/MainDisplay";

export default function Main() {
  return (
    <div className="relative">
      <MainDisplay />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        id="modal-root"
      />
    </div>
  );
}
