import { useMemo, useState } from "react";
import {
  Factory,
  Package,
  CheckCircle2,
  Clock3,
  AlertCircle,
  X,
  Save,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { usePO } from "../context/POContext";
import Badge from "../components/ui/Badge";

function Production() {
  const {
    orders,
    updateItemProduction,
  } = usePO();

  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState(null);
  const [productionQty, setProductionQty] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // HELPERS
  // =====================================================

  const getItems = (order) => {
    if (!order || !Array.isArray(order.items)) {
      return [];
    }

    return order.items.filter(Boolean);
  };

  const getQty = (item) => {
    return Math.max(Number(item?.qty || 0), 0);
  };

  const getCompletedQty = (item) => {
    return Math.max(
      Number(item?.production?.completedQty || 0),
      0
    );
  };

  const getRemainingQty = (item) => {
    const qty = getQty(item);
    const completed = getCompletedQty(item);

    return Math.max(qty - completed, 0);
  };

  const getProgress = (item) => {
    const qty = getQty(item);
    const completed = getCompletedQty(item);

    if (qty <= 0) {
      return 0;
    }

    return Math.min(
      Math.round((completed / qty) * 100),
      100
    );
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(value || 0)
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // PRODUCTION ITEMS
  // =====================================================

  const productionItems = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    const result = [];

    orders.forEach((order) => {
      const items = getItems(order);

      items.forEach((item) => {
        const qty = getQty(item);
        const completedQty = getCompletedQty(item);
        const remainingQty = getRemainingQty(item);

        // Hanya tampilkan item yang masih punya pekerjaan produksi
        if (qty > 0 && remainingQty > 0) {
          result.push({
            order,
            item,
            qty,
            completedQty,
            remainingQty,
            progress: getProgress(item),
          });
        }
      });
    });

    return result;
  }, [orders]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    const poIds = new Set();

    let totalQty = 0;
    let completedQty = 0;
    let remainingQty = 0;

    productionItems.forEach(
      ({
        order,
        qty,
        completedQty: completed,
        remainingQty: remaining,
      }) => {
        poIds.add(String(order.id));

        totalQty += qty;
        completedQty += completed;
        remainingQty += remaining;
      }
    );

    const progress =
      totalQty > 0
        ? Math.min(
            Math.round(
              (completedQty / totalQty) * 100
            ),
            100
          )
        : 0;

    return {
      totalPO: poIds.size,
      totalQty,
      completedQty,
      remainingQty,
      progress,
    };
  }, [productionItems]);

  // =====================================================
  // OPEN UPDATE MODAL
  // =====================================================

  const handleOpenUpdate = (data) => {
    setSelectedItem(data);
    setProductionQty(
      String(data.completedQty)
    );
    setError("");
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseUpdate = () => {
    setSelectedItem(null);
    setProductionQty("");
    setError("");
  };

  // =====================================================
  // SAVE PRODUCTION
  // =====================================================

  const handleSaveProduction = () => {
    if (!selectedItem) {
      return;
    }

    const qty = Number(selectedItem.qty);
    const value = Number(productionQty);

    if (
      productionQty === "" ||
      Number.isNaN(value)
    ) {
      setError(
        "Masukkan jumlah produksi yang valid."
      );
      return;
    }

    if (value < 0) {
      setError(
        "Jumlah produksi tidak boleh kurang dari 0."
      );
      return;
    }

    if (value > qty) {
      setError(
        `Jumlah produksi tidak boleh lebih dari ${formatNumber(
          qty
        )} pcs.`
      );
      return;
    }

    updateItemProduction(
      selectedItem.order.id,
      selectedItem.item.id,
      value
    );

    handleCloseUpdate();
  };

  // =====================================================
  // STATUS DISPLAY
  // =====================================================

  const getProductionStatus = (progress) => {
    if (progress >= 100) {
      return "Selesai";
    }

    if (progress > 0) {
      return "Berjalan";
    }

    return "Belum Mulai";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Factory size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Production
            </h1>

            <p className="text-sm text-slate-500">
              Monitor dan update progres produksi PO
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* PO PRODUKSI */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                PO Dalam Produksi
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatNumber(summary.totalPO)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PO yang masih memiliki sisa produksi
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Package
                size={22}
                className="text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SUDAH PRODUKSI */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sudah Diproduksi
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatNumber(
                  summary.completedQty
                )}{" "}
                <span className="text-base font-medium text-slate-400">
                  pcs
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Dari {formatNumber(summary.totalQty)} pcs
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <CheckCircle2
                size={22}
                className="text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SISA PRODUKSI */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sisa Produksi
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatNumber(
                  summary.remainingQty
                )}{" "}
                <span className="text-base font-medium text-slate-400">
                  pcs
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Progress {summary.progress}%
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Clock3
                size={22}
                className="text-slate-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Overall Production
            </h2>

            <p className="text-sm text-slate-500">
              {formatNumber(
                summary.completedQty
              )}{" "}
              dari{" "}
              {formatNumber(summary.totalQty)} pcs
              sudah diproduksi
            </p>
          </div>

          <div className="text-2xl font-bold text-slate-900">
            {summary.progress}%
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{
              width: `${summary.progress}%`,
            }}
          />
        </div>
      </div>

      {/* =================================================
          PRODUCTION TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Production Orders
            </h2>

            <p className="text-sm text-slate-500">
              Update jumlah produksi setiap item
            </p>
          </div>
        </div>

        {productionItems.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Semua produksi selesai
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Tidak ada item yang masih memiliki
              sisa produksi.
            </p>
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">
                    PO
                  </th>

                  <th className="px-5 py-3">
                    Customer
                  </th>

                  <th className="px-5 py-3">
                    Item
                  </th>

                  <th className="px-5 py-3">
                    Deadline
                  </th>

                  <th className="px-5 py-3 text-center">
                    Qty
                  </th>

                  <th className="px-5 py-3 text-center">
                    Selesai
                  </th>

                  <th className="px-5 py-3 text-center">
                    Sisa
                  </th>

                  <th className="px-5 py-3">
                    Progress
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productionItems.map(
                  (data) => {
                    const {
                      order,
                      item,
                      qty,
                      completedQty,
                      remainingQty,
                      progress,
                    } = data;

                    return (
                      <tr
                        key={`${order.id}-${item.id}`}
                        className="transition hover:bg-slate-50"
                      >
                        {/* PO */}

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/purchase-orders/${order.id}`
                              )
                            }
                            className="font-semibold text-slate-900 hover:underline"
                          >
                            {order.poNumber ||
                              order.id}
                          </button>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">
                          <p className="max-w-[180px] truncate text-sm font-medium text-slate-800">
                            {order.customer ||
                              "-"}
                          </p>
                        </td>

                        {/* ITEM */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">
                              {item.name ||
                                "-"}
                            </p>

                            {item.code && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.code}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* DEADLINE */}

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            order.deadline
                          )}
                        </td>

                        {/* QTY */}

                        <td className="px-5 py-4 text-center text-sm font-semibold text-slate-900">
                          {formatNumber(qty)}
                        </td>

                        {/* SELESAI */}

                        <td className="px-5 py-4 text-center text-sm font-semibold text-slate-900">
                          {formatNumber(
                            completedQty
                          )}
                        </td>

                        {/* SISA */}

                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-orange-600">
                            {formatNumber(
                              remainingQty
                            )}
                          </span>
                        </td>

                        {/* PROGRESS */}

                        <td className="px-5 py-4">
                          <div className="w-36">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                {getProductionStatus(
                                  progress
                                )}
                              </span>

                              <span className="font-semibold text-slate-900">
                                {progress}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-900 transition-all"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/purchase-orders/${order.id}`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                              <Eye size={15} />
                              Detail
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenUpdate(
                                  data
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                            >
                              <Factory
                                size={15}
                              />
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          UPDATE PRODUCTION MODAL
      ================================================= */}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Update Produksi
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedItem.order.poNumber ||
                    selectedItem.order.id}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseUpdate}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-5">
              {/* ITEM */}

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedItem.item.name ||
                    "-"}
                </p>

                {selectedItem.item.code && (
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedItem.item.code}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Qty Order
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatNumber(
                        selectedItem.qty
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Sudah Dibuat
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatNumber(
                        selectedItem.completedQty
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Sisa
                    </p>

                    <p className="mt-1 font-semibold text-orange-600">
                      {formatNumber(
                        selectedItem.remainingQty
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Jumlah Sudah Diproduksi
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={selectedItem.qty}
                    value={productionQty}
                    onChange={(event) => {
                      setProductionQty(
                        event.target.value
                      );
                      setError("");
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        handleSaveProduction();
                      }

                      if (
                        event.key === "Escape"
                      ) {
                        handleCloseUpdate();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-14 text-lg font-semibold outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    placeholder="0"
                    autoFocus
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    pcs
                  </span>
                </div>

                {error && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  Maksimal{" "}
                  {formatNumber(
                    selectedItem.qty
                  )}{" "}
                  pcs.
                </p>
              </div>

              {/* INFO */}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Progress setelah update
                  </span>

                  <span className="font-semibold text-slate-900">
                    {selectedItem.qty > 0
                      ? Math.min(
                          Math.round(
                            (Number(
                              productionQty ||
                                0
                            ) /
                              selectedItem.qty) *
                              100
                          ),
                          100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{
                      width: `${
                        selectedItem.qty > 0
                          ? Math.min(
                              Math.round(
                                (Number(
                                  productionQty ||
                                    0
                                ) /
                                  selectedItem.qty) *
                                  100
                              ),
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {Number(
                  productionQty || 0
                ) >= selectedItem.qty && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    Produksi akan dianggap selesai
                    dan PO dapat masuk ke proses QC.
                  </p>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={handleCloseUpdate}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveProduction}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Save size={16} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Production;