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
    <header
      className="flex justify-between items-center
     bg-primary-purple border-b border-slate-200 text-black
     px-6 py-4"
    >
      TIME TURTLE
      <UserSelect users={users} setUserById={setUserById} />
      <Link href={"/main/register"}>New User</Link>
    </header>
  );
}
