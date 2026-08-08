import { forwardRef } from "react";
import { FaChevronDown } from "react-icons/fa6";

const FormField = forwardRef(function FormField(
  { label, id, error, type = "text", as = "input", required = false, children, className = "", ...rest },
  ref
) {
  const Component = as;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label-uppercase mb-2 block">
          {label}
          {required && (
            <span className="text-burgundy-500 dark:text-burgundy-300" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}
      {as === "select" ? (
        <div className="relative">
          <Component
            id={id}
            ref={ref}
            className="input-field appearance-none pe-9"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-required={required || undefined}
            {...rest}
          >
            {children}
          </Component>
          <FaChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 h-3 w-3 -translate-y-1/2 text-charcoal-400 dark:text-ivory-300"
          />
        </div>
      ) : (
        <Component
          id={id}
          type={type}
          ref={ref}
          className="input-field"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required={required || undefined}
          {...rest}
        />
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-burgundy-400 dark:text-burgundy-300"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;
