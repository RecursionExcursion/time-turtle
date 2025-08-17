import { ComponentPropsWithoutRef } from "react";

export default function MenuAnchor(props: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...props}
      className="rounded-xl px-3 py-2 hover:bg-[var(--secondary-slate)]"
    ></a>
  );
}
