import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { usePO } from "../context/POContext";
import Badge from "../components/ui/Badge";

function PODetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { orders, getOrderById } = usePO();

  // Ambil PO berdasarkan ID dari URL
  const order =
    getOrderById?.(id) ||
    orders.find((item) => String(item.id) === String(id));

  // =====================================================
  // FORMAT
  // =====================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
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
  };

  // =====================================================
  // ORDER TIDAK DITEMUKAN
  // =====================================================

  if (!order) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Purchase Orders
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <ClipboardList className="h-6 w-6 text-slate-400" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Purchase Order tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Data PO dengan ID{" "}
            <span className="font-semibold text-slate-700">{id}</span>{" "}
            tidak ditemukan di sistem.
          </p>

          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar PO
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const items = order.items || [];

  const totalQty = items.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  const totalValue = items.reduce(
    (total, item) =>
      total +
      Number(item.qty || 0) *
        Number(item.price ?? item.unitPrice ?? 0),
    0
  );

  const totalProduction = items.reduce(
    (total, item) =>
      total + Number(item.production?.completedQty || 0),
    0
  );

  const totalQC = items.reduce(
    (total, item) =>
      total + Number(item.qc?.passedQty || 0),
    0
  );

  const totalShipped = items.reduce(
    (total, item) =>
      total + Number(item.delivery?.shippedQty || 0),
    0
  );

  const productionPercentage =
    totalQty > 0
      ? Math.min(100, Math.round((totalProduction / totalQty) * 100))
      : 0;

  const qcPercentage =
    totalQty > 0
      ? Math.min(100, Math.round((totalQC / totalQty) * 100))
      : 0;

  const deliveryPercentage =
    totalQty > 0
      ? Math.min(100, Math.round((totalShipped / totalQty) * 100))
      : 0;

  // =====================================================
  // WORKFLOW
  // =====================================================

  const workflow = [
    "Order Masuk",
    "Cek Material",
    "Produksi",
    "QC",
    "Packing",
    "Siap Kirim",
    "Terkirim",
    "Selesai",
  ];

  const currentStatusIndex = workflow.indexOf(order.status);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Purchase Orders
          </button>

          <p className="text-sm font-medium text-slate-500">
            Purchase Order Detail
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {order.poNumber || "-"}
            </h1>

            <Badge>{order.status || "Order Masuk"}</Badge>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Detail lengkap purchase order dan progres pengerjaan.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-400">Customer</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {order.customer || "-"}
          </p>
        </div>
      </div>

      {/* =====================================================
          WORKFLOW
      ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Progress Order
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Status pengerjaan PO saat ini.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-[800px] items-start">
            {workflow.map((status, index) => {
              const isCompleted =
                currentStatusIndex >= 0 &&
                index <= currentStatusIndex;

              const isCurrent = order.status === status;

              return (
                <div
                  key={status}
                  className="flex flex-1 items-start"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-2 text-center text-[11px] font-medium ${
                        isCurrent
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {status}
                    </p>
                  </div>

                  {index < workflow.length - 1 && (
                    <div
                      className={`mt-4 h-0.5 flex-1 ${
                        isCompleted && index < currentStatusIndex
                          ? "bg-slate-900"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          PO INFORMATION
      ===================================================== */}

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <ClipboardList className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">No. PO</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {order.poNumber || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <CalendarDays className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Tanggal PO</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(order.orderDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Clock3 className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Deadline</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(order.deadline)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Package className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Total Nilai</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DETAIL BARANG
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-500" />

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Detail Barang
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Daftar barang yang terdapat pada purchase order.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">
                  Barang
                </th>

                <th className="px-5 py-3 font-semibold">
                  Kode
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Qty
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Harga
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Subtotal
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  Produksi
                </th>

                <th className="px-5 py-3 text-right font-semibold">
                  QC
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const qty = Number(item.qty || 0);
                const price = Number(
                  item.price ?? item.unitPrice ?? 0
                );

                const production = Number(
                  item.production?.completedQty || 0
                );

                const qc = Number(
                  item.qc?.passedQty || 0
                );

                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.code || "-"}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {qty.toLocaleString("id-ID")} pcs
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {formatCurrency(price)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                      {formatCurrency(qty * price)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {production.toLocaleString("id-ID")} /{" "}
                      {qty.toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {qc.toLocaleString("id-ID")} /{" "}
                      {qty.toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="border-t border-slate-200 bg-slate-50">
              <tr>
                <td
                  colSpan="2"
                  className="px-5 py-4 text-sm font-semibold text-slate-900"
                >
                  Total
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                  {totalQty.toLocaleString("id-ID")} pcs
                </td>

                <td />

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                  {formatCurrency(totalValue)}
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                  {totalProduction.toLocaleString("id-ID")}
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                  {totalQC.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>

          {items.length === 0 && (
            <div className="p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Belum ada item
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PO ini belum memiliki barang.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PROGRESS SUMMARY
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-3">
        {/* PRODUKSI */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Produksi
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Progress produksi
              </p>
            </div>

            <span className="text-sm font-bold text-slate-900">
              {productionPercentage}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${productionPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {totalProduction.toLocaleString("id-ID")} dari{" "}
            {totalQty.toLocaleString("id-ID")} pcs
          </p>
        </div>

        {/* QC */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Quality Control
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Barang lolos QC
              </p>
            </div>

            <span className="text-sm font-bold text-slate-900">
              {qcPercentage}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${qcPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {totalQC.toLocaleString("id-ID")} dari{" "}
            {totalQty.toLocaleString("id-ID")} pcs
          </p>
        </div>

        {/* DELIVERY */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pengiriman
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Barang terkirim
              </p>
            </div>

            <span className="text-sm font-bold text-slate-900">
              {deliveryPercentage}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${deliveryPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {totalShipped.toLocaleString("id-ID")} dari{" "}
            {totalQty.toLocaleString("id-ID")} pcs
          </p>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER / DELIVERY INFO
      ===================================================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-900">
              Informasi Customer
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs text-slate-400">
                Customer
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {order.customer || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                No. Purchase Order
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {order.poNumber || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-900">
              Informasi Pengiriman
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">
                Total Quantity
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {totalQty.toLocaleString("id-ID")} pcs
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Sudah Terkirim
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {totalShipped.toLocaleString("id-ID")} pcs
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Sisa
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {Math.max(
                  0,
                  totalQty - totalShipped
                ).toLocaleString("id-ID")}{" "}
                pcs
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Deadline
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(order.deadline)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PODetail;