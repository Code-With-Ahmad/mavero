export default function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center ${
          accent
            ? "bg-burgundy-500 text-ivory"
            : "bg-charcoal-800 text-ivory dark:bg-gold-500 dark:text-charcoal-900"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="label-uppercase text-[11px]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-charcoal-900 dark:text-ivory-100">{value}</p>
      </div>
    </div>
  );
}
