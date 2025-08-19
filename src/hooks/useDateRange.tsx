/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useDatePicker } from "./useDatePicker";
import { useModal } from "./useModal";

export function useDateRange(modalId: string) {
  //   const { modalId } = props;

  const { Modal, setModal, setShowModal } = useModal({ id: modalId });

  const {
    PickerInputs: ToPickerInputs,
    date: ToDate,
    CalendarSelector: ToCalendarSelector,
  } = useDatePicker({
    date: new Date(),
    iconAction(setter, showDialog) {
      setter(!showDialog);
      setShowModal(!showDialog);
    },
  });
  const {
    PickerInputs: FromPickerInputs,
    date: fromDate,
    CalendarSelector: FromCalendarSelector,
  } = useDatePicker({
    date: new Date(),
    iconAction(setter, showDialog) {
      setter(!showDialog);
      setShowModal(!showDialog);
    },
  });

  useEffect(() => {
    if (!ToCalendarSelector.showSelector) {
      setShowModal(false);
      return;
    }

    setModal(ToCalendarSelector.selector());
  }, [ToCalendarSelector.showSelector]);

  useEffect(() => {
    if (!FromCalendarSelector.showSelector) {
      setShowModal(false);
      return;
    }

    setModal(FromCalendarSelector.selector());
  }, [FromCalendarSelector.showSelector]);

  return {
    modal: Modal(),
    from: {
      inputs: FromPickerInputs,
      calendar: FromCalendarSelector.selectorButton,
      date: fromDate,
    },
    to: {
      inputs: ToPickerInputs,
      calendar: ToCalendarSelector.selectorButton,
      date: ToDate,
    },
  };
}
