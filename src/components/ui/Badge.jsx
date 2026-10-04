const statusStyles = {
  "Order Masuk":
    "bg-slate-100 text-slate-700",

  "Cek Material":
    "bg-amber-50 text-amber-700",

  Produksi:
    "bg-blue-50 text-blue-700",

  QC:
    "bg-purple-50 text-purple-700",

  Packing:
    "bg-cyan-50 text-cyan-700",

  "Siap Kirim":
    "bg-orange-50 text-orange-700",

  Terkirim:
    "bg-emerald-50 text-emerald-700",

  Selesai:
    "bg-green-100 text-green-700",

  Terlambat:
    "bg-red-50 text-red-700",

  Dibatalkan:
    "bg-slate-100 text-slate-500",
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Normal: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
};

function Badge({ children, type = "status" }) {
  const styles =
    type === "priority"
      ? priorityStyles[children]
      : statusStyles[children];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
        styles || "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

export default Badge;