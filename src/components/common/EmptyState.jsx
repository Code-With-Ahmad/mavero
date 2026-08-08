export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      {icon && (
        <div className="mb-4 text-4xl text-charcoal-200 dark:text-charcoal-400" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold text-charcoal-800 dark:text-ivory-100">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-charcoal-400 dark:text-ivory-300">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
