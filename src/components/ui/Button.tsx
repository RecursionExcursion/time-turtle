"use client";

import { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonThemes = "shadow" | "hollow";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
  theme?: ButtonThemes;
};

export default function Button(props: ButtonProps) {
  const { theme = "shadow", ...rest } = props;

  function getTheme(): ReactNode {
    switch (theme) {
      case "shadow":
        return <ShadowButton {...rest} />;
      case "hollow":
        return <HollowButton {...rest} />;
    }
  }

  return getTheme();
}

function ShadowButton(props: ButtonProps) {
  const { children, ...attr } = props;
  return (
    <button
      className="group relative inline-block text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden"
      {...attr}
    >
      <span className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-indigo-600 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></span>

      <span className="relative block border border-current bg-white px-8 py-3">
        {children}
      </span>
    </button>
  );
}

function HollowButton(props: ButtonProps) {
  const { children, ...attr } = props;
  return (
    <button
      className="group inline-block rounded-sm bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] text-black hover:text-white focus:ring-3 focus:outline-hidden"
      {...attr}
    >
      <span className="block rounded-xs bg-white px-8 py-3 text-sm font-medium group-hover:bg-transparent">
        {children}
      </span>
    </button>
  );
}
