"use client";

import { ReactNode } from "react";
import { useDateRange } from "../../hooks/useDateRange";
import TimeTableControls from "./TimeTableControls";
import ExportImport from "./ImportExportUI";

export default function MainSidebar() {
  // const {} = useModal({ id: "modal" });
  const { modal, to, from } = useDateRange("modal-root");

  return (
    // <aside className="col-[1] row-[1/3] bg-[var(--primary-slate)] text-slate-100 p-4 flex flex-col gap-4">
    //   <h1 className="text-xl font-semibold text-[var(--primary-purple)]W">
    //     Time Turtle
    //   </h1>
    //   <nav className="flex flex-col gap-2">
    //     <MenuAnchor href="#">Dashboard</MenuAnchor>
    //     <MenuAnchor href="#">Projects</MenuAnchor>
    //     <MenuAnchor href="#">Reports</MenuAnchor>
    //     <MenuAnchor href="#">Settings</MenuAnchor>
    //   </nav>
    //   <DateRangeSelector modalId="modal-root" />
    // </aside>
    <div className="flex h-screen w-16 flex-col justify-between border-e border-gray-100 bg-white">
      <div>
        <div className="inline-flex size-16 items-center justify-center">
          <span className="grid size-10 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600">
            LOGO
          </span>
        </div>

        <div className="border-t border-gray-100">
          <div className="px-2">
            <ul className="space-y-1 border-t border-gray-100 pt-4">
              <TimeTableControls />
              <ExportImport />
              <MenuItem
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                toolTip="Teams"
              />
              <MenuItem
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                }
                toolTip="Billing"
              />

              <MenuItem
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                }
                toolTip="Invoices"
              />
              <MenuItem
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                toolTip="Account"
              />

              <MenuItem
                icon={from.calendar({
                  className: "text-black cursor-pointer",
                })}
                toolTip="From"
              />
              <MenuItem
                icon={to.calendar({
                  className: "text-black cursor-pointer",
                })}
                toolTip="To"
              />
            </ul>
          </div>
        </div>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
        <a
          href="#"
          className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5 opacity-75"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>

          <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
            Logout
          </span>
        </a>
      </div>
      {modal}
    </div>
  );
}

type MenuItemProps = {
  href?: string;
  icon: ReactNode;
  toolTip: string;
};

function MenuItem(props: MenuItemProps) {
  const { icon, toolTip, href = "#" } = props;
  return (
    <li>
      <a
        href={href}
        className="group relative flex justify-center rounded-sm px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      >
        {icon}
        <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
          {toolTip}
        </span>
      </a>
    </li>
  );
}
