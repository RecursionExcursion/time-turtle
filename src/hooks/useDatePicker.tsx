"use client";

import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  Dispatch,
  JSX,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

type IconAction = (
  b: (b: boolean) => void,
  showDialog: boolean,
  selector: ReactNode
) => void;

type UseDatePickerProps = {
  date?: Date;
  iconAction?: IconAction;
};

export function useDatePicker(props: UseDatePickerProps) {
  const [date, setDate] = useState(props.date ?? new Date());

  const { picker: inputs, selector } = CreateDatePickerWithModal({
    date: date,
    setDate: setDate,
    iconAction: props.iconAction,
  });

  return {
    PickerInputs: inputs,
    CalendarSelector: selector,
    date,
  };
}

const icons: Record<string, ReactNode> = {
  calender: <CalendarSVG />,
};

type DatePickerProps = {
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
  setValidityFlag?: Dispatch<SetStateAction<boolean>>;
  onlyModal?: boolean;
  iconAction?: IconAction;
};

function CreateDatePickerWithModal(props: DatePickerProps) {
  const {
    date: initalDate,
    setDate: setParentDate,
    setValidityFlag,
    iconAction,
  } = props;

  const [date, setDate] = useState(initalDate);

  const [inputDate, setInputDate] = useState({
    month: date.getMonth() + 1,
    day: date.getDate(),
    year: date.getFullYear(),
  });

  const [dateIsValid, setDateIsValid] = useState(true);

  //can be bool or undefined to check against initialization
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    setInputDate({
      month: date.getMonth() + 1,
      day: date.getDate(),
      year: date.getFullYear(),
    });
  }, [date]);

  useEffect(() => {
    const newDate = new Date(
      inputDate.year,
      inputDate.month - 1,
      inputDate.day
    );

    const monthsAreEqual = newDate.getMonth() === inputDate.month - 1;
    const daysAreEqual = newDate.getDate() == inputDate.day;
    const yearsAreEqual = newDate.getFullYear() === inputDate.year;
    const datesAreEqual = monthsAreEqual && daysAreEqual && yearsAreEqual;

    setDateIsValid(datesAreEqual);

    if (datesAreEqual) {
      if (setParentDate) {
        setParentDate(newDate);
      }
    }
    if (setValidityFlag) {
      setValidityFlag(datesAreEqual);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputDate]);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const returnValue: number | "" = parseInt(value);

    const isNumber = /^\d+$/.test(value);
    const isEmpty = value === "";

    const isNumberOrEmpty = isEmpty || isNumber;

    if (!isNumberOrEmpty) return;

    const validityMap: Record<string, () => boolean> = {
      month: () => !(value.split("").length > 2),
      day: () => !(value.split("").length > 2),
      year: () => !(value.split("").length > 4),
    };

    const isValid = validityMap[name as keyof typeof validityMap]();
    if (!isValid) return;

    setInputDate((prev) => ({
      ...prev,
      [name]: isEmpty ? "" : returnValue,
    }));
  };

  return {
    picker: {
      month: function (props: ComponentPropsWithoutRef<"input">) {
        return (
          <input
            // className={styles.picker.input}
            name="month"
            type="text"
            value={inputDate.month}
            onChange={handleDateChange}
            {...props}
          />
        );
      },
      day: function (props: ComponentPropsWithoutRef<"input">) {
        return (
          <input
            name="day"
            // className={styles.picker.input}
            type="text"
            value={inputDate.day}
            onChange={handleDateChange}
            {...props}
          />
        );
      },
      year: function (props: ComponentPropsWithoutRef<"input">) {
        return (
          <input
            name="year"
            // className={[styles.picker.input, "w-20"].join(" ")}
            type="text"
            value={inputDate.year}
            onChange={handleDateChange}
            {...props}
          />
        );
      },
    },
    selector: {
      selector: function () {
        return (
          <DateSelector
            key={date.getTime()}
            parentDate={date}
            setParentDate={setDate}
            setShowDialog={setShowDialog}
          />
        );
      },
      showSelectorState: {
        set: setShowDialog,
        state: showDialog,
      },
      selectorButton: function (
        props?: ComponentPropsWithoutRef<"button"> & {
          icon?: ReactNode;
        }
      ) {
        const { icon = icons.calender, ...attr } = props ?? {};
        return (
          <button
            onClick={
              iconAction
                ? () =>
                    iconAction(
                      (b: boolean) => setShowDialog(b),
                      showDialog,
                      <DateSelector
                        key={date.getTime()}
                        parentDate={date}
                        setParentDate={setDate}
                        setShowDialog={setShowDialog}
                      />
                    )
                : () => setShowDialog(!showDialog)
            }
            {...attr}
          >
            {icon}
          </button>
        );
      },
    },
  };
}

/* Below is the code for the calendar UI */
const styles = {
  // picker: {
  //   button: `px-0 py-1 cursor-pointer text-white hover:text-cyan-400 `,
  //   wrapper:
  //     "flex items-center justify-center text-primary bg-accent h-12 w-fit rounded-[5px]",
  //   wrapperInvalidOutline: "outline outline-[0.2rem] outline-red-500",
  //   input: "rounded-[0.25rem] text-black p-1 px-2 w-10 text-center",
  // },
  selector: {
    wrapper:
      "flex items-center justify-center flex-col gap-2 rounded-md text-black bg-white",
    controlContainer:
      "flex justify-between w-full bg-blue-500 p-2 box-border rounded-md rounded-b-none",
    monthContainer: "box-border grid w-full grid-cols-[1rem_1fr_1rem] px-2",
    grid: "grid grid-cols-7 w-full box-border p-2",
    cell: "text-center border border-black p-2 cursor-pointer hover:bg-cyan-400",
    monthButton: "text-primary cursor-pointer font-bold",
  },
};

type DateSelectorProps = {
  parentDate: Date;
  setParentDate: Dispatch<SetStateAction<Date>>;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
};

export function DateSelector(props: DateSelectorProps) {
  const { parentDate, setParentDate, setShowDialog } = props;

  const [calendarDate, setCalendarDate] = useState(parentDate);

  function setDate(d: Date) {
    setCalendarDate(d);
    setParentDate(d);
  }

  const monthName = `${getFullMonthName(
    calendarDate
  )} ${calendarDate.getFullYear()}`;

  const firstOnCalender = getFirstOnCalender(calendarDate);

  const generateDaySquares = (): JSX.Element[] => {
    const calendarLength = 35;
    const calenderStartDate = firstOnCalender;

    return Array.from({ length: calendarLength }).map((_, i) => {
      const cellDate = changeDate(calenderStartDate, i, "day");
      return (
        <DateSelectorCell
          key={cellDate.toISOString()}
          date={cellDate}
          selectedDate={calendarDate}
          setter={setDate}
        />
      );
    });
  };

  return (
    <div className={styles.selector.wrapper}>
      <div className={styles.selector.controlContainer}>
        <button
          className="cursor-pointer font-bold text-black"
          onClick={() => setDate(new Date())}
        >
          Reset
        </button>
        <button
          className="cursor-pointer font-bold text-black"
          onClick={() => setShowDialog(false)}
        >
          X
        </button>
      </div>
      <div className={styles.selector.monthContainer}>
        <MonthSelectorButton
          dir="back"
          onClick={() => setDate(changeDate(calendarDate, -1, "month"))}
        />
        <h3 className="text-center font-bold">{monthName}</h3>
        <MonthSelectorButton
          dir="forward"
          onClick={() => setDate(changeDate(calendarDate, 1, "month"))}
        />
      </div>
      <div className={styles.selector.grid}>{generateDaySquares()}</div>
    </div>
  );
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

type DateSelectorCellProps = {
  selectedDate: Date;
  date: Date;
  setter: (d: Date) => void;
};
function DateSelectorCell(props: DateSelectorCellProps) {
  const { date, selectedDate, setter } = props;
  const isSelected = isSameDay(date, selectedDate);
  const isToday = isSameDay(date, new Date());

  return (
    <div
      className={[
        styles.selector.cell,
        isSelected ? "bg-blue-500" : isToday ? "bg-green-500" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => setter(date)}
    >
      {date.getDate()}
    </div>
  );
}

type MonthSelectorButtonProps = {
  dir: "back" | "forward";
  onClick: () => void;
};

function MonthSelectorButton(props: MonthSelectorButtonProps) {
  const { dir, onClick } = props;

  const text = dir === "back" ? "<" : ">";

  return (
    <button className={styles.selector.monthButton} onClick={onClick}>
      {text}
    </button>
  );
}

type ChangeType = "day" | "week" | "month" | "year";

function changeDate(date: Date, amount: number, change: ChangeType): Date {
  const newDate = new Date(date);

  const map = new Map<ChangeType, (date: Date, amount: number) => void>([
    ["day", (date, amount) => date.setDate(date.getDate() + amount)],
    ["week", (date, amount) => date.setDate(date.getDate() + amount * 7)],
    ["month", (date, amount) => date.setMonth(date.getMonth() + amount)],
    ["year", (date, amount) => date.setFullYear(date.getFullYear() + amount)],
  ]);

  map.get(change)?.(newDate, amount);

  return newDate;
}

function getFullMonthName(date: Date): string {
  return date.toLocaleString("default", { month: "long" });
}

function getFirstOnCalender(date: Date): Date {
  return changeDate(
    getFirstOfMonth(date),
    -getFirstOfMonth(date).getDay(),
    "day"
  );
}

function getFirstOfMonth(date: Date): Date {
  return changeDate(date, -date.getDate() + 1, "day");
}

function CalendarSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-calendar-days"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}
