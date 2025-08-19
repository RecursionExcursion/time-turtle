/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useDatePicker } from "./useDatePicker";
import { useModal } from "./useModal";

export function useDateRange(modalId: string) {
  const { Modal, setModal, setShowModal } = useModal({ id: modalId });
  const to = useDatePicker({ date: new Date() });
  const from = useDatePicker({ date: new Date() });

  const [modalKey, setModalKey] = useState<"to" | "from" | undefined>();

  useEffect(() => {
    if (!modalKey) {
      setShowModal(false);
      return;
    }

    setShowModal(true);

    if (modalKey === "to") {
      setModal(<to.CalendarSelector.selector key={"to"} />);
      from.CalendarSelector.showSelectorState.set(false);
      return;
    }
    if (modalKey === "from") {
      setModal(<from.CalendarSelector.selector key={"from"} />);
      to.CalendarSelector.showSelectorState.set(false);
      return;
    }
  }, [modalKey]);

  useEffect(() => {
    if (from.CalendarSelector.showSelectorState.state) setModalKey("from");
    else if (modalKey === "from") setModalKey(undefined);
  }, [from.CalendarSelector.showSelectorState.state]);
  useEffect(() => {
    if (to.CalendarSelector.showSelectorState.state) {
      setModalKey("to");
    } else if (modalKey === "to") setModalKey(undefined);
  }, [to.CalendarSelector.showSelectorState.state]);

  return {
    modal: Modal(),
    from: {
      inputs: from.PickerInputs,
      calendar: from.CalendarSelector.selectorButton,
      date: from.date,
    },
    to: {
      inputs: to.PickerInputs,
      calendar: to.CalendarSelector.selectorButton,
      date: to.date,
    },
  };
}
