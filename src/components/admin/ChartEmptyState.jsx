import { FaChartSimple } from "react-icons/fa6";

// A chart with axes and gridlines but zero data points reads as broken —
// this replaces the chart entirely rather than letting Recharts render an
// empty plot area.
export default function ChartEmptyState({ height = 260, message }) {
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center gap-2 text-charcoal-300 dark:text-charcoal-500"
    >
      <FaChartSimple className="h-6 w-6" aria-hidden="true" />
      <p className="text-xs text-charcoal-400 dark:text-ivory-300">{message}</p>
    </div>
  );
}
