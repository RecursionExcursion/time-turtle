"use client";

import Link from "next/link";
import { User } from "../../lib/time-turtle";

import UserSelect from "./UserSelect";

type MainHeaderProps = {
  users?: User[];
  setUserById: (id: string) => void;
};

export default function MainHeader(props: MainHeaderProps) {
  const { users = [], setUserById } = props;

  return (
    <header className="col-[2] row-[1] bg-slate-300 border-b border-slate-200 px-6 py-4 flex items-center justify-between text-black">
      TIME TURTLE
      <UserSelect users={users} setUserById={setUserById} />
      <Link href={"/main/register"}>New User</Link>
    </header>
  );
}
