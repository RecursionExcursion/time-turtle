"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { TimeTurtleModel, TimeTurtle, User } from "../../lib/time-turtle";
import localRepo from "../../service/client-persistence-service";
import MainHeader from "../../components/app/MainHeader";

type AppContextState = {
  user?: User;
  createUser: (name: string, email: string) => void;
  saveUser: (u: User) => void;
};

export const AppContext = createContext<AppContextState>({} as AppContextState);

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: AppProviderProps) => {
  const [user, setUser] = useState<User>();
  const [timeTurtleData, setTimeTurtleData] = useState<TimeTurtle>();

  useEffect(() => {
    console.log("Fetching data");
    localRepo.read().then((data) => {
      if (data) {
        setTimeTurtleData(data);
        if (data.users.length) {
          setUser(data.users[0]);
        }
      } else {
        console.log("No data found creating new DS");
        setTimeTurtleData({ users: [] });
      }
    });
  }, []);

  function setUserById(id: string) {
    const usr = timeTurtleData?.users.find((u) => u.info.id === id);
    if (usr) setUser(usr);
  }

  function createUser(name: string, email: string) {
    if (timeTurtleData) {
      const newUser = TimeTurtleModel.user.create(name, email);
      const copy = TimeTurtleModel.time.clone(timeTurtleData);
      TimeTurtleModel.time.addUser(newUser, copy);
      localRepo.save(copy);
      setTimeTurtleData(copy);
    }
  }

  function saveUser(usr: User) {
    if (timeTurtleData) {
      const usrIndex = timeTurtleData.users.findIndex(
        (u) => u.info.id === usr.info.id
      );
      if (usrIndex !== -1) {
        const copy = TimeTurtleModel.time.clone(timeTurtleData);
        copy.users[usrIndex] = usr;
        localRepo.save(copy);
        setTimeTurtleData(copy);
        setUser(TimeTurtleModel.user.cloneUser(usr));
      }
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        createUser,
        saveUser,
      }}
    >
      <div className="flex flex-col gap-5 h-screen text-white">
        <MainHeader users={timeTurtleData?.users} setUserById={setUserById} />
        {props.children}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
