import { Plus } from "lucide-react";

import Button from "../components/ui/Button";
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentOrders from "../components/dashboard/RecentOrders";
import AttentionOrders from "../components/dashboard/AttentionOrders";

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Company Report System
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Monitoring Purchase Order
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pantau seluruh PO dari order masuk sampai selesai.
          </p>
        </div>

      
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Recent Orders */}
      <RecentOrders />

      {/* Attention */}
      <AttentionOrders />
    </div>
  );
}

export default Dashboard;