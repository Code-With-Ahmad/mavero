import { forwardRef } from "react";
import { FaCheck } from "react-icons/fa6";

// A plain native checkbox renders with whatever tiny, harsh-cornered
// widget the OS/browser ships — appearance-none strips that so this can
// draw a branded box + checkmark instead, while the real <input> stays in
// place (just visually hidden via peer-*) for keyboard/screen-reader use.
const Checkbox = forwardRef(function Checkbox({ label, id, className = "", ...rest }, ref) {
  return (
    <label htmlFor={id} className={`flex w-fit cursor-pointer items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className="peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none border border-charcoal-300 bg-ivory transition-colors duration-150 ease-refined checked:border-gold-600 checked:bg-gold-500 dark:border-charcoal-400 dark:bg-charcoal-700 dark:checked:border-gold-400 dark:checked:bg-gold-500"
          {...rest}
        />
        <FaCheck
          aria-hidden="true"
          className="pointer-events-none absolute h-2.5 w-2.5 text-charcoal-900 opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span className="text-sm text-charcoal-600 dark:text-ivory-200">{label}</span>}
    </label>
  );
});

export default Checkbox;
