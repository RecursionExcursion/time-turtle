"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../../context/AppContext";

export default function RegisterPage() {
  const { createUser } = useAppContext();

  const router = useRouter();

  const [regState, setRegState] = useState({
    name: "",
    email: "",
  });

  return (
    <div className="flex flex-col gap-5 items-center">
      <RegSection
        text="Name"
        setValue={(e) => {
          setRegState((prev) => ({
            ...prev,
            name: e.target.value,
          }));
        }}
      />
      <RegSection
        text="Email"
        setValue={(e) => {
          setRegState((prev) => ({
            ...prev,
            email: e.target.value,
          }));
        }}
      />
      <button
        className="cursor-pointer border border-white w-20"
        onClick={() => {
          createUser(regState.name, regState.email);
          router.push("/main");
        }}
      >
        Submit
      </button>
    </div>
  );
}

type RegSectionProps = {
  text: string;
  setValue: (e: ChangeEvent<HTMLInputElement>) => void;
};

function RegSection(props: RegSectionProps) {
  const { text, setValue } = props;
  return (
    <div className="flex gap-2">
      <div>{text}</div>
      <input
        onChange={setValue}
        type="text"
        className="border border-white"
      ></input>
    </div>
  );
}
