"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  TimeTurtle,
  TimeTurtleModel,
  User,
  UserModel,
} from "../../lib/time-turtle";
import localRepo from "../../service/client-persistence-service";
import MainHeader from "../../components/app/MainHeader";

type AppContextState = {
  user?: User;
  createUser: (u: User) => void;
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

  function createUser(newUser: User) {
    if (timeTurtleData) {
      const copy = TimeTurtleModel.clone(timeTurtleData);
      TimeTurtleModel.addUser(newUser, copy);
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
        const copy = TimeTurtleModel.clone(timeTurtleData);
        copy.users[usrIndex] = usr;
        localRepo.save(copy);
        setTimeTurtleData(copy);
        setUser(UserModel.cloneUser(usr));
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
