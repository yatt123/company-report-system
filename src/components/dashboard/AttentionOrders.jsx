import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { usePO } from "../../context/POContext";

import Badge from "../ui/Badge";

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getDeadlineState(order) {
  if (!order?.deadline) {
    return {
      isLate: false,
      label: "Deadline belum ada",
    };
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const deadline = new Date(order.deadline);

  if (Number.isNaN(deadline.getTime())) {
    return {
      isLate: false,
      label: "Deadline tidak valid",
    };
  }

  deadline.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (deadline - today) /
      (1000 * 60 * 60 * 24)
  );

  if (
    diff < 0 &&
    !["Selesai", "Terkirim"].includes(
      order.status
    )
  ) {
    return {
      isLate: true,
      label: `Terlambat ${Math.abs(diff)} hari`,
    };
  }

  if (diff === 0) {
    return {
      isLate: false,
      label: "Deadline hari ini",
    };
  }

  if (diff <= 3) {
    return {
      isLate: false,
      label: `${diff} hari lagi`,
    };
  }

  return {
    isLate: false,
    label: `${diff} hari lagi`,
  };
}

function AttentionOrders() {
  const { orders } = usePO();
  const navigate = useNavigate();

  const attentionOrders = Array.isArray(orders)
    ? orders
        .map((order) => ({
          order,
          deadline: getDeadlineState(order),
        }))
        .filter(
          ({ order, deadline }) =>
            deadline.isLate ||
            order?.priority === "High" ||
            order?.priority === "Urgent"
        )
        .sort((a, b) => {
          if (
            a.deadline.isLate !==
            b.deadline.isLate
          ) {
            return a.deadline.isLate ? -1 : 1;
          }

          return String(
            a.order?.deadline || ""
          ).localeCompare(
            String(b.order?.deadline || "")
          );
        })
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Perlu Perhatian
          </h2>

          <p className="text-xs text-slate-400">
            PO yang membutuhkan monitoring
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {attentionOrders
          .slice(0, 4)
          .map(({ order, deadline }) => {
            const firstItem =
              Array.isArray(order?.items)
                ? order.items[0]
                : null;

            return (
              <div
                key={order.id}
                className="p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      onClick={() =>
                        navigate(
                          `/purchase-orders/${order.id}`
                        )
                      }
                      className="truncate text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {order?.poNumber || "-"}
                    </button>

                    <p className="mt-1 text-sm text-slate-600">
                      {firstItem?.name || "-"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />

                        {formatDate(
                          order?.deadline
                        )}
                      </span>

                      <span
                        className={
                          deadline.isLate
                            ? "font-semibold text-red-600"
                            : "font-medium text-amber-600"
                        }
                      >
                        {deadline.label}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Badge>
                      {order?.status || "-"}
                    </Badge>
                  </div>
                </div>

                {order?.priority && (
                  <div className="mt-3">
                    <Badge type="priority">
                      Priority: {order.priority}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}

        {attentionOrders.length === 0 && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <span className="text-emerald-600">
                ✓
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-600">
              Tidak ada PO yang perlu perhatian.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Semua PO dalam kondisi aman.
            </p>
          </div>
        )}
      </div>

      {attentionOrders.length > 4 && (
        <button
          onClick={() =>
            navigate("/purchase-orders")
          }
          className="flex w-full items-center justify-center gap-2 border-t border-slate-200 p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default AttentionOrders;