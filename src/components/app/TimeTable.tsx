import { useMemo } from "react";
import { TimeEntry } from "../../models/time-user";

type TimeTableProps = {
  entries: TimeEntry[];
};

export default function TimeTable(props: TimeTableProps) {
  const { entries } = props;
  const rows = useMemo(() => [...entries].reverse(), [entries]);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700">
        <thead className="sticky top-0 bg-white ltr:text-left rtl:text-right dark:bg-gray-900">
          <tr className="*:font-medium *:text-gray-900 dark:*:text-white">
            <th className="px-3 py-2 whitespace-nowrap">In</th>
            <th className="px-3 py-2 whitespace-nowrap">Out</th>
            <th className="px-3 py-2 whitespace-nowrap">Flags</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 *:even:bg-gray-50 dark:divide-gray-700 dark:*:even:bg-gray-800">
          {rows.map((e) => (
            <tr
              key={e.id}
              className="*:text-gray-900 *:first:font-medium dark:*:text-white"
            >
              <td className="px-3 py-2 whitespace-nowrap">
                {dateToString(e.inTime)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {e.outTime ? dateToString(e.outTime) : "open"}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {e.flags.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function dateToString(d: number) {
  return new Date(d).toLocaleString();
}
