"use client";

import { TimeUser } from "../../models/time-user";
import Button from "../ui/Button";
import DateRangeSelector from "./DateRangeSelector";

type MainHeaderProps = {
  filterEntries: () => void;
  handleClick: () => void;
  user: TimeUser;
};

export default function MainHeader(props: MainHeaderProps) {
  const { user, handleClick } = props;

  return (
    <header className="col-[2] row-[1] bg-slate-300 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <DateRangeSelector modalId="modal-root" />
      <div className="flex items-center gap-3 ml-auto">
        <Button onClick={handleClick}>
          {user.getOpenEntries().length ? "Clock Out" : "Clock In"}
        </Button>
      </div>
    </header>
  );
}
