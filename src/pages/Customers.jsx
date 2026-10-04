import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

import { usePO } from "../context/POContext";

function Customers() {
  const { orders } = usePO();

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  // =====================================================
  // FORMAT
  // =====================================================

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(value || 0)
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // CUSTOMER DATA
  // =====================================================

  const customers = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    const customerMap = new Map();

    orders.forEach((order) => {
      const customerName =
        order?.customer ||
        order?.company ||
        order?.client ||
        "Customer Tidak Diketahui";

      const normalizedName =
        String(customerName).trim();

      if (!customerMap.has(normalizedName)) {
        customerMap.set(normalizedName, {
          name: normalizedName,
          orders: [],
          totalPO: 0,
          completedPO: 0,
          activePO: 0,
          totalValue: 0,
        });
      }

      const customer =
        customerMap.get(
          normalizedName
        );

      customer.orders.push(order);

      customer.totalPO += 1;

      customer.totalValue += Number(
        order?.totalValue || 0
      );

      if (order?.status === "Selesai") {
        customer.completedPO += 1;
      } else {
        customer.activePO += 1;
      }
    });

    return Array.from(
      customerMap.values()
    ).sort(
      (a, b) =>
        b.totalValue -
        a.totalValue
    );
  }, [orders]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCustomers = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(keyword)
    );
  }, [
    customers,
    search,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    return {
      totalCustomers:
        customers.length,

      totalPO: customers.reduce(
        (total, customer) =>
          total +
          customer.totalPO,
        0
      ),

      completedPO:
        customers.reduce(
          (total, customer) =>
            total +
            customer.completedPO,
          0
        ),

      totalValue:
        customers.reduce(
          (total, customer) =>
            total +
            customer.totalValue,
          0
        ),
    };
  }, [customers]);

  // =====================================================
  // SELECT CUSTOMER
  // =====================================================

  const openCustomer = (
    customer
  ) => {
    setSelectedCustomer(
      customer
    );
  };

  // =====================================================
  // CUSTOMER DETAIL
  // =====================================================

  const customerOrders =
    selectedCustomer?.orders ||
    [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Building2 size={18} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
              Customers
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              Database customer berdasarkan seluruh PO.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <SummaryCard
          icon={
            <Building2
              size={16}
              className="text-blue-500"
            />
          }
          label="Total Customer"
          value={formatNumber(
            summary.totalCustomers
          )}
        />

        <SummaryCard
          icon={
            <ClipboardList
              size={16}
              className="text-slate-500"
            />
          }
          label="Total PO"
          value={formatNumber(
            summary.totalPO
          )}
        />

        <SummaryCard
          icon={
            <CheckCircle2
              size={16}
              className="text-emerald-500"
            />
          }
          label="PO Selesai"
          value={formatNumber(
            summary.completedPO
          )}
        />

        <SummaryCard
          icon={
            <TrendingUp
              size={16}
              className="text-purple-500"
            />
          }
          label="Total Nilai PO"
          value={formatCurrency(
            summary.totalValue
          )}
          small
        />
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Cari nama customer..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:text-sm"
          />
        </div>
      </div>

      {/* =================================================
          CUSTOMER LIST
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
        <div className="border-b border-slate-200 p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Daftar Customer
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                {filteredCustomers.length} customer
                ditampilkan
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE */}

        <div className="space-y-2.5 p-3 sm:hidden">
          {filteredCustomers.length ===
          0 ? (
            <EmptyState />
          ) : (
            filteredCustomers.map(
              (customer) => (
                <button
                  key={customer.name}
                  type="button"
                  onClick={() =>
                    openCustomer(
                      customer
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <CustomerAvatar
                      name={
                        customer.name
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {customer.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Klik untuk melihat detail
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <MiniStat
                      label="PO"
                      value={formatNumber(
                        customer.totalPO
                      )}
                    />

                    <MiniStat
                      label="Selesai"
                      value={formatNumber(
                        customer.completedPO
                      )}
                    />

                    <MiniStat
                      label="Berjalan"
                      value={formatNumber(
                        customer.activePO
                      )}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-400">
                      Nilai PO
                    </span>

                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(
                        customer.totalValue
                      )}
                    </span>
                  </div>
                </button>
              )
            )
          )}
        </div>

        {/* DESKTOP */}

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">
                  Customer
                </th>

                <th className="px-5 py-3 text-center">
                  Total PO
                </th>

                <th className="px-5 py-3 text-center">
                  Selesai
                </th>

                <th className="px-5 py-3 text-center">
                  Berjalan
                </th>

                <th className="px-5 py-3 text-right">
                  Total Nilai
                </th>

                <th className="px-5 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(
                (customer) => (
                  <tr
                    key={customer.name}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar
                          name={
                            customer.name
                          }
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {customer.name}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Customer aktif
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
                      {formatNumber(
                        customer.totalPO
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {customer.completedPO}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {customer.activePO}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        customer.totalValue
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          openCustomer(
                            customer
                          )
                        }
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                )
              )}

              {filteredCustomers.length ===
                0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12"
                  >
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          CUSTOMER DETAIL MODAL
      ================================================= */}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <CustomerAvatar
                  name={
                    selectedCustomer.name
                  }
                />

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                    {selectedCustomer.name}
                  </h2>

                  <p className="text-[10px] text-slate-400 sm:text-xs">
                    Detail customer & riwayat PO
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={17} />
              </button>
            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-3 gap-2 border-b border-slate-200 p-3 sm:gap-3 sm:p-4">
              <DetailStat
                label="Total PO"
                value={formatNumber(
                  selectedCustomer.totalPO
                )}
              />

              <DetailStat
                label="Selesai"
                value={formatNumber(
                  selectedCustomer.completedPO
                )}
              />

              <DetailStat
                label="Nilai PO"
                value={formatCurrency(
                  selectedCustomer.totalValue
                )}
              />
            </div>

            {/* PO LIST */}

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              <h3 className="mb-3 text-xs font-bold text-slate-900 sm:text-sm">
                Riwayat Purchase Order
              </h3>

              <div className="space-y-2">
                {customerOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-slate-200 p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 sm:text-sm">
                            {order?.poNumber ||
                              order?.poNo ||
                              `PO-${order?.id}`}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDate(
                              order?.orderDate
                            )}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                            order?.status
                          )}`}
                        >
                          {order?.status ||
                            "Order Masuk"}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <MiniStat
                          label="Qty"
                          value={formatNumber(
                            getOrderQty(
                              order
                            )
                          )}
                        />

                        <MiniStat
                          label="Produksi"
                          value={formatNumber(
                            getProductionQty(
                              order
                            )
                          )}
                        />

                        <MiniStat
                          label="Terkirim"
                          value={formatNumber(
                            getShippedQty(
                              order
                            )
                          )}
                        />

                        <MiniStat
                          label="Nilai"
                          value={formatCurrency(
                            order?.totalValue
                          )}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =======================================================
// HELPERS
// =======================================================

function getOrderQty(order) {
  return (order?.items || []).reduce(
    (total, item) =>
      total +
      Number(item?.qty || 0),
    0
  );
}

function getProductionQty(order) {
  return (order?.items || []).reduce(
    (total, item) =>
      total +
      Number(
        item?.production
          ?.completedQty || 0
      ),
    0
  );
}

function getShippedQty(order) {
  const shipments =
    order?.delivery?.shipments ||
    [];

  return shipments.reduce(
    (total, shipment) => {
      const shipmentQty =
        (shipment?.items || []).reduce(
          (sum, item) =>
            sum +
            Number(
              item?.qty || 0
            ),
          0
        );

      return (
        total + shipmentQty
      );
    },
    0
  );
}

function getStatusClass(status) {
  switch (status) {
    case "Selesai":
      return "bg-emerald-50 text-emerald-700";

    case "Terkirim":
      return "bg-green-50 text-green-700";

    case "Terkirim Sebagian":
      return "bg-orange-50 text-orange-700";

    case "Siap Kirim":
      return "bg-blue-50 text-blue-700";

    case "QC":
      return "bg-purple-50 text-purple-700";

    case "Produksi":
      return "bg-amber-50 text-amber-700";

    case "Terlambat":
    case "Dibatalkan":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

// =======================================================
// COMPONENTS
// =======================================================

function SummaryCard({
  icon,
  label,
  value,
  small = false,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 sm:text-xs">
          {label}
        </span>

        {icon}
      </div>

      <p
        className={`mt-2 truncate font-bold text-slate-900 ${
          small
            ? "text-sm sm:text-lg"
            : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CustomerAvatar({
  name,
}) {
  const initial =
    String(name || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
      {initial}
    </div>
  );
}

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <p className="text-[9px] text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function DetailStat({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5 sm:p-3">
      <p className="text-[9px] text-slate-400 sm:text-[10px]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-900 sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <Building2
        size={28}
        className="mx-auto text-slate-300"
      />

      <p className="mt-2 text-xs font-semibold text-slate-500">
        Customer tidak ditemukan
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        Coba gunakan kata kunci yang berbeda.
      </p>
    </div>
  );
}

export default Customers;