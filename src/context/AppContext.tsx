"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { TimeTurtle, User } from "../lib/time-turtle";
import localRepo from "../service/client-persistence-service";
import MainHeader from "../components/app/MainHeader";

type AppContextState = {
  user?: User;
  createUser: (name: string, email: string) => void;
  punch: () => void;
};

export const AppContext = createContext<AppContextState>({} as AppContextState);

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: AppProviderProps) => {
  const [user, setUser] = useState<User>();
  const [timeTurtleData, setTimeTurtleData] = useState<TimeTurtle>();

  useEffect(() => {
    localRepo.read().then((data) => {
      if (data) {
        setTimeTurtleData(new TimeTurtle({ tt: data }));
        if (data.users.length) {
          setUser(data.users[0]);
        }
      } else {
        console.log("No data found creating new DS");
        setTimeTurtleData(new TimeTurtle());
      }
    });
  }, []);

  async function punchClock() {
    if (!timeTurtleData || !user) return;

    const uId = user.info.id;

    const copy = timeTurtleData.user.clone(user);
    const loe = timeTurtleData.user.getLatestOpenEntry(user);
    if (!loe) {
      await timeTurtleData.user.createTimeEntry(uId);
    } else {
      await timeTurtleData.user.closeTimeEntry(uId, loe.id);
    }
    saveUser(copy);
  }

  function save() {
    if (!timeTurtleData) return;

    localRepo.save(timeTurtleData.tt);
    setTimeTurtleData(timeTurtleData.clone());
  }

  function setUserById(id: string) {
    const usr = timeTurtleData?.getUser(id);
    if (usr) setUser(usr);
  }

  function createUser(name: string, email: string) {
    if (!timeTurtleData) return;

    timeTurtleData.user.register(name, email);
    save();
  }

  function saveUser(usr: User) {
    if (!timeTurtleData) return;

    const ok = timeTurtleData.user.update(usr);
    if (ok) {
      save();
      setUser(timeTurtleData.user.clone(usr));
    }
  }

  return (
    <AppContext.Provider
      value={{
        punch: punchClock,
        user,
        createUser,
      }}
    >
      <div className="flex flex-col gap-5 h-screen text-white">
        <MainHeader
          users={timeTurtleData?.tt.users}
          setUserById={setUserById}
        />
        {props.children}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
