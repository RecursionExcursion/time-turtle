"use client";

import { ChangeEvent } from "react";
import { User } from "../../lib/time-turtle";

type UserSelectProps = {
  users: User[];
  setUserById: (id: string) => void;
};

export default function UserSelect(props: UserSelectProps) {
  const { users, setUserById } = props;
  return (
    <div>
      <label htmlFor="Headline">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          User
        </span>

        <select
          name="Headline"
          id="Headline"
          className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setUserById(e.target.value);
          }}
        >
          <option value="">Please select</option>
          {users.map((u) => (
            <option key={u.info.id} value={u.info.id}>
              {u.info.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
