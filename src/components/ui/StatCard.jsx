function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-slate-100 text-slate-600",
  valueClassName = "text-slate-900",
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${valueClassName}`}
          >
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;