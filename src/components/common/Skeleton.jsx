export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-charcoal-100 dark:bg-charcoal-500 ${className}`}
      aria-hidden="true"
    />
  );
}
