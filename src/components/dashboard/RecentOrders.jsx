import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { usePO } from "../../context/POContext";
import Badge from "../ui/Badge";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

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

function getOrderTotal(order) {
  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  return items.reduce((total, item) => {
    const qty = Number(item?.qty || 0);
    const unitPrice = Number(item?.unitPrice || 0);

    return total + qty * unitPrice;
  }, 0);
}

function getDeadlineInfo(order) {
  if (!order?.deadline) {
    return {
      label: "-",
      className: "text-slate-400",
    };
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const deadline = new Date(order.deadline);

  if (Number.isNaN(deadline.getTime())) {
    return {
      label: "-",
      className: "text-slate-400",
    };
  }

  deadline.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (deadline - today) / (1000 * 60 * 60 * 24)
  );

  const finishedStatuses = [
    "Selesai",
    "Terkirim",
  ];

  if (
    diff < 0 &&
    !finishedStatuses.includes(order.status)
  ) {
    return {
      label: `Terlambat ${Math.abs(diff)} hari`,
      className: "text-red-600",
    };
  }

  if (diff === 0) {
    return {
      label: "Deadline hari ini",
      className: "text-red-600",
    };
  }

  if (diff <= 3) {
    return {
      label: `${diff} hari lagi`,
      className: "text-amber-600",
    };
  }

  return {
    label: `${diff} hari lagi`,
    className: "text-slate-500",
  };
}

function RecentOrders() {
  const { orders } = usePO();
  const navigate = useNavigate();

  const recentOrders = Array.isArray(orders)
    ? [...orders]
        .sort((a, b) => {
          const dateA = new Date(
            a?.orderDate || 0
          ).getTime();

          const dateB = new Date(
            b?.orderDate || 0
          ).getTime();

          return dateB - dateA;
        })
        .slice(0, 6)
    : [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            PO Terbaru
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Purchase order terbaru yang masuk ke sistem
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/purchase-orders")
          }
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Lihat Semua
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">
                No. PO
              </th>

              <th className="px-5 py-3 font-semibold">
                Customer
              </th>

              <th className="px-5 py-3 font-semibold">
                Barang
              </th>

              <th className="px-5 py-3 font-semibold">
                Qty
              </th>

              <th className="px-5 py-3 font-semibold">
                Total
              </th>

              <th className="px-5 py-3 font-semibold">
                Deadline
              </th>

              <th className="px-5 py-3 font-semibold">
                Status
              </th>

              <th className="px-5 py-3 font-semibold">
                Priority
              </th>

              <th className="px-5 py-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const items = Array.isArray(
                order?.items
              )
                ? order.items
                : [];

              const firstItem = items[0];

              const deadline =
                getDeadlineInfo(order);

              const totalQty = items.reduce(
                (sum, item) =>
                  sum + Number(item?.qty || 0),
                0
              );

              return (
                <tr
                  key={order.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        navigate(
                          `/purchase-orders/${order.id}`
                        )
                      }
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {order?.poNumber || "-"}
                    </button>

                    {items.length > 1 && (
                      <p className="mt-1 text-xs text-slate-400">
                        +{items.length - 1} item
                        lainnya
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {order?.customer || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {firstItem?.name || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {firstItem?.code || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {totalQty.toLocaleString(
                      "id-ID"
                    )}{" "}
                    pcs
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {formatCurrency(
                      getOrderTotal(order)
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {formatDate(order?.deadline)}
                    </p>

                    <p
                      className={`mt-1 text-xs font-medium ${deadline.className}`}
                    >
                      {deadline.label}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <Badge>
                      {order?.status || "-"}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    {order?.priority ? (
                      <Badge type="priority">
                        {order.priority}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">
                        -
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/purchase-orders/${order.id}`
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      title="Lihat detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {recentOrders.length === 0 && (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            Belum ada purchase order.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Data PO akan muncul di sini setelah
            tersedia.
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentOrders;