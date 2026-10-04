import { useMemo, useState } from "react";

import {
  Plus,
  Search,
  Eye,
  Filter,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { usePO } from "../context/POContext";

import Badge from "../components/ui/Badge";

function PurchaseOrders() {
  const navigate = useNavigate();

  const { orders, deleteOrder } = usePO();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const statuses = [
    "Semua",
    "Order Masuk",
    "Cek Material",
    "Produksi",
    "QC",
    "Packing",
    "Siap Kirim",
    "Terkirim Sebagian",
    "Terkirim",
    "Selesai",
  ];

  // =====================================================
  // FILTER PO
  // =====================================================

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        order.poNumber?.toLowerCase().includes(keyword) ||
        order.customer?.toLowerCase().includes(keyword) ||
        order.items?.some(
          (item) =>
            item.name?.toLowerCase().includes(keyword) ||
            item.code?.toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "Semua" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // =====================================================
  // TOTAL QTY
  // =====================================================

  const getTotalQty = (order) => {
    return (order.items || []).reduce(
      (total, item) => total + Number(item.qty || 0),
      0
    );
  };

  // =====================================================
  // TOTAL NILAI PO
  // qty x price
  // =====================================================

  const getTotalValue = (order) => {
    return (order.items || []).reduce(
      (total, item) =>
        total +
        Number(item.qty || 0) *
          Number(item.price || 0),
      0
    );
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // =====================================================
  // DELETE PO
  // =====================================================

  const handleDelete = (order) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus ${order.poNumber}?\n\n` +
        `Customer: ${order.customer}\n\n` +
        `Semua data PO, item, produksi, QC, dan pengiriman ` +
        `yang terkait akan ikut terhapus.\n\n` +
        `Data yang sudah dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) return;

    deleteOrder(order.id);
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalPO = orders.length;

  const totalQty = orders.reduce(
    (total, order) => total + getTotalQty(order),
    0
  );

  const totalValue = orders.reduce(
    (total, order) => total + getTotalValue(order),
    0
  );

  const activePO = orders.filter(
    (order) => order.status !== "Selesai"
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Purchase Order
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Purchase Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola seluruh purchase order yang masuk.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/purchase-orders/new")
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Tambah PO
        </button>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL PO */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total PO
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalPO.toLocaleString("id-ID")}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            seluruh purchase order
          </p>
        </div>

        {/* PO AKTIF */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            PO Aktif
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {activePO.toLocaleString("id-ID")}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            belum selesai
          </p>
        </div>

        {/* TOTAL QTY */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Quantity
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalQty.toLocaleString("id-ID")}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            pcs
          </p>
        </div>

        {/* NILAI PO */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Nilai PO
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatCurrency(totalValue)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            total nilai seluruh PO
          </p>
        </div>
      </div>

      {/* =================================================
          SEARCH & FILTER
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari No. PO, customer, nama barang, atau kode barang..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* STATUS */}

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="h-10 w-full min-w-[190px] appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SEARCH INFO */}

        {(search || statusFilter !== "Semua") && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {filteredOrders.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-700">
                {orders.length}
              </span>{" "}
              PO
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("Semua");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Daftar Purchase Order
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Seluruh PO yang tercatat di sistem.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">
                  No. PO
                </th>

                <th className="px-5 py-3 font-semibold">
                  Customer
                </th>

                <th className="px-5 py-3 font-semibold">
                  Tanggal PO
                </th>

                <th className="px-5 py-3 font-semibold">
                  Deadline
                </th>

                <th className="px-5 py-3 font-semibold">
                  Item
                </th>

                <th className="px-5 py-3 font-semibold">
                  Qty
                </th>

                <th className="px-5 py-3 font-semibold">
                  Nilai PO
                </th>

                <th className="px-5 py-3 font-semibold">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition hover:bg-slate-50"
                >
                  {/* PO NUMBER */}

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/purchase-orders/${order.id}`
                        )
                      }
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {order.poNumber}
                    </button>
                  </td>

                  {/* CUSTOMER */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {order.customer}
                  </td>

                  {/* ORDER DATE */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(order.orderDate)}
                  </td>

                  {/* DEADLINE */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(order.deadline)}
                  </td>

                  {/* ITEMS */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {(order.items || []).length} item
                  </td>

                  {/* QTY */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {getTotalQty(order).toLocaleString(
                      "id-ID"
                    )}{" "}
                    pcs
                  </td>

                  {/* VALUE */}

                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                    {formatCurrency(
                      getTotalValue(order)
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <Badge>
                      {order.status}
                    </Badge>
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {/* DETAIL */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/purchase-orders/${order.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Eye className="h-4 w-4" />
                        Detail
                      </button>

                      {/* HAPUS */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(order)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Search className="h-5 w-5 text-slate-400" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                PO tidak ditemukan
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Coba gunakan kata pencarian atau filter
                yang berbeda.
              </p>

              {(search ||
                statusFilter !== "Semua") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("Semua");
                  }}
                  className="mt-4 text-xs font-medium text-slate-700 hover:underline"
                >
                  Reset pencarian
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrders;