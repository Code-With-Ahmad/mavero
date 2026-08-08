import { forwardRef } from "react";
import { FaChevronDown } from "react-icons/fa6";

// Native <select> arrows are rendered by the browser and don't respect
// author padding consistently, which is why a plain `.input-field` select
// looks like it has more space before the text on the start side than
// before the arrow on the end side. appearance-none removes the native
// arrow entirely so this component can reserve and center its own.
const Select = forwardRef(function Select({ className = "", children, ...rest }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`input-field appearance-none pe-9 ${className}`}
        {...rest}
      >
        {children}
      </select>
      <FaChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 h-3 w-3 -translate-y-1/2 text-charcoal-400 dark:text-ivory-300"
      />
    </div>
  );
});

export default Select;
