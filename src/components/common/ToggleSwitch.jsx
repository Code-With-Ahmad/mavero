export default function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-refined disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-gold-500" : "bg-charcoal-200 dark:bg-charcoal-600"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ease-refined ${
          checked ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-[3px] rtl:-translate-x-[3px]"
        }`}
      />
    </button>
  );
}
