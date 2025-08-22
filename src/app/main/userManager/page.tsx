"use client";

import { useAppContext } from "../../../context/AppContext";

export default function UserManagerPage() {
  const { deleteUser, user } = useAppContext();
  return (
    <div>
      <button
        className="border border-red-300 cursor-pointer"
        onClick={() => {
          const ok = confirm(
            `Are you sure you want to delete ${user?.info.name}. \nThis action cannot be undone!`
          );
          if (ok) deleteUser();
        }}
      >
        Delete
      </button>
      <>UserManagerPage</>
    </div>
  );
}
