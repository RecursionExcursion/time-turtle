"use client";

import { createContext, useContext, useEffect, useState } from "react";
import MainHeader from "../components/app/MainHeader";
import { db } from "../db/db";
import { closeTimeEntry, createTimeEntry } from "../service/time-service";
import { createNewUser, getLastOpenEntry } from "../service/user-service";
import { TimeEntry, User, UserDTO } from "../types/time-turtle";
import { useIsProcessing } from "../hooks/useIsProcessing";
import { useRouter } from "next/navigation";

type AppContextState = {
  user?: User;
  createUser: (name: string, email: string) => void;
  deleteUser: () => void;
  punch: () => void;
  isWorking: boolean;
};

export const AppContext = createContext<AppContextState>({} as AppContextState);

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: AppProviderProps) => {
  const router = useRouter();
  const { isWorking, work } = useIsProcessing();
  const [userList, setUserList] = useState<UserDTO[]>([]);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    db.init()
      .then(() => db.getAll())
      .then((usrs) => setUserList(usrs));
  }, []);

  async function updateUser() {
    if (!user) return;

    db.getUser(user.info.id).then((u) => {
      if (u) setUser(u);
    });
  }

  async function punchClock() {
    if (!user) return;

    work(async () => {
      const loe = getLastOpenEntry(user);

      const entry: TimeEntry = loe
        ? await closeTimeEntry(loe)
        : await createTimeEntry();

      await db.saveTimeEntry(entry, user.info.id);
      updateUser();
    });
  }

  async function setUserById(id: string) {
    const usr = await db.getUser(id);
    if (usr) setUser(usr);
    else setUser(undefined);
  }

  function createUser(name: string, email: string) {
    work(async () => {
      const usr = createNewUser(name, email);
      db.saveUser(usr).then(() =>
        db.getUser(usr.info.id).then((u) => {
          if (u) {
            setUserList((prev) => [
              { name: u?.info.name, id: u?.info.id },
              ...prev,
            ]);
            setUser(u);
          }
        })
      );
    });
  }

  function deleteUser() {
    if (!user) return;
    work(async () => {
      await db.deleteUser(user.info.id);
      const usrs = await db.getAll();
      setUserList(usrs);
      router.push("/main");
    });
  }

  return (
    <AppContext.Provider
      value={{
        punch: punchClock,
        user,
        createUser,
        isWorking,
        deleteUser,
      }}
    >
      <div className="flex flex-col gap-5 h-screen text-white">
        <MainHeader users={userList} setUserById={setUserById} />
        {props.children}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
