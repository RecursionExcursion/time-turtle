/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { createPortal } from "react-dom";
import { useDatePicker } from "../../hooks/useDatePicker";
import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";

type DateRangeSelectorProps = {
  modalId: string;
};

export default function DateRangeSelector(props: DateRangeSelectorProps) {
  const { modalId } = props;

  const { Modal, setModal, setShowModal } = useModal({ id: modalId });

  const {
    DatePicker: ToDatePicker,
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
    DatePicker: FromDatePicker,
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

    setModal(ToCalendarSelector.selector);
  }, [ToCalendarSelector.showSelector]);

  useEffect(() => {
    if (!FromCalendarSelector.showSelector) {
      setShowModal(false);
      return;
    }

    setModal(FromCalendarSelector.selector);
  }, [FromCalendarSelector.showSelector]);

  return (
    <div className="flex flex-col items-center gap-7">
      Filter:
      <div className="flex items-center">
        From:
        {FromDatePicker}
        {FromCalendarSelector.selectorButton}
      </div>
      <div className="flex items-center">
        To:
        {ToDatePicker}
        {ToCalendarSelector.selectorButton}
      </div>
      {Modal()}
    </div>
  );
}
