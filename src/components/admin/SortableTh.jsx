import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function SortableTh({ label, sortKey, currentKey, direction, onSort, className = "" }) {
  const isActive = currentKey === sortKey;
  const Icon = isActive ? (direction === "asc" ? FaSortUp : FaSortDown) : FaSort;

  return (
    <th className={`py-2 pe-4 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 hover:text-charcoal-700 dark:hover:text-ivory-100"
      >
        {label}
        <Icon
          className={`h-3 w-3 ${
            isActive ? "text-gold-600 dark:text-gold-400" : "text-charcoal-300 dark:text-charcoal-500"
          }`}
        />
      </button>
    </th>
  );
}
