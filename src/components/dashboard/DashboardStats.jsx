import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { usePO } from "../../context/POContext";
import StatCard from "../ui/StatCard";

function DashboardStats() {
  const { stats } = usePO();

  console.log(stats)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total PO"
        value={stats?.totalPO ?? 0}
        icon={ClipboardList}
        iconClassName="bg-slate-100 text-slate-700"
        description="Seluruh purchase order"
      />

      <StatCard
        label="Sedang Diproses"
        value={stats?.processing ?? 0}
        icon={Clock3}
        iconClassName="bg-blue-50 text-blue-600"
        description="PO aktif saat ini"
      />

      <StatCard
        label="Selesai"
        value={stats?.completed ?? 0}
        icon={CheckCircle2}
        iconClassName="bg-emerald-50 text-emerald-600"
        valueClassName="text-emerald-600"
        description="PO telah selesai"
      />

      <StatCard
        label="Terlambat"
        value={stats?.delayed ?? 0}
        icon={AlertTriangle}
        iconClassName="bg-red-50 text-red-600"
        valueClassName="text-red-600"
        description="Perlu perhatian"
      />
    </div>
  );
}

export default DashboardStats;