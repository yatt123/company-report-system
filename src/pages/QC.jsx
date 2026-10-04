import { useMemo, useState } from "react";

import {
  ClipboardCheck,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Save,
  X,
  AlertCircle,
  Eye,
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { usePO } from "../context/POContext";

function QC() {
  const {
    orders,
    updateItemQC,
    resetItemQC,
  } = usePO();

  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState(null);
  const [qcQty, setQcQty] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // =====================================================
  // HELPERS
  // =====================================================

  const getItems = (order) => {
    if (!order || !Array.isArray(order.items)) {
      return [];
    }

    return order.items.filter(Boolean);
  };

  const getProducedQty = (item) => {
    return Math.max(
      Number(item?.production?.completedQty || 0),
      0
    );
  };

  const getCheckedQty = (item) => {
    const producedQty = getProducedQty(item);

    const qcQty = Number(
      item?.qc?.passedQty ??
        item?.qc?.checkedQty ??
        0
    );

    return Math.min(
      Math.max(qcQty, 0),
      producedQty
    );
  };

  const getPendingQty = (item) => {
    return Math.max(
      getProducedQty(item) -
        getCheckedQty(item),
      0
    );
  };

  const getProgress = (item) => {
    const producedQty = getProducedQty(item);
    const checkedQty = getCheckedQty(item);

    if (producedQty <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (checkedQty / producedQty) * 100
      ),
      100
    );
  };

  const getQCStatus = (progress) => {
    if (progress >= 100) {
      return "Selesai";
    }

    if (progress > 0) {
      return "Berjalan";
    }

    return "Belum Mulai";
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
  // ALL QC ITEMS
  // =====================================================

  const allQCItems = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    const result = [];

    orders.forEach((order) => {
      const items = getItems(order);

      items.forEach((item) => {
        const producedQty =
          getProducedQty(item);

        if (producedQty <= 0) {
          return;
        }

        const checkedQty =
          getCheckedQty(item);

        const pendingQty =
          Math.max(
            producedQty - checkedQty,
            0
          );

        const progress =
          getProgress(item);

        result.push({
          order,
          item,
          producedQty,
          checkedQty,
          pendingQty,
          progress,
          qcStatus:
            getQCStatus(progress),
        });
      });
    });

    return result;
  }, [orders]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const qcItems = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return allQCItems.filter((data) => {
      const {
        order,
        item,
        qcStatus,
      } = data;

      const matchesSearch =
        !keyword ||
        String(order.poNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.customer || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.code || "")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" ||
        qcStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    allQCItems,
    search,
    statusFilter,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    const poIds = new Set();

    let producedQty = 0;
    let checkedQty = 0;
    let pendingQty = 0;

    allQCItems.forEach(
      ({
        order,
        producedQty: produced,
        checkedQty: checked,
        pendingQty: pending,
      }) => {
        poIds.add(String(order.id));

        producedQty += produced;
        checkedQty += checked;
        pendingQty += pending;
      }
    );

    const progress =
      producedQty > 0
        ? Math.min(
            Math.round(
              (checkedQty / producedQty) *
                100
            ),
            100
          )
        : 0;

    return {
      totalPO: poIds.size,
      producedQty,
      checkedQty,
      pendingQty,
      progress,
    };
  }, [allQCItems]);

  // =====================================================
  // OPEN QC
  // =====================================================

  const handleOpenQC = (data) => {
    setSelectedItem(data);
    setQcQty("");
    setError("");
  };

  // =====================================================
  // CLOSE QC
  // =====================================================

  const handleCloseQC = () => {
    setSelectedItem(null);
    setQcQty("");
    setError("");
  };

  // =====================================================
  // INPUT QC
  // =====================================================

  const handleQCInput = (value) => {
    if (value === "") {
      setQcQty("");
      setError("");
      return;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return;
    }

    const maxQty =
      selectedItem?.pendingQty || 0;

    const safeValue = Math.max(
      0,
      Math.min(
        numericValue,
        maxQty
      )
    );

    setQcQty(safeValue);
    setError("");
  };

  // =====================================================
  // SAVE QC
  // =====================================================

  const handleSaveQC = () => {
    if (!selectedItem) {
      return;
    }

    const inputQty = Number(qcQty);

    if (
      qcQty === "" ||
      Number.isNaN(inputQty)
    ) {
      setError(
        "Masukkan jumlah QC yang valid."
      );
      return;
    }

    if (inputQty <= 0) {
      setError(
        "Jumlah QC harus lebih dari 0."
      );
      return;
    }

    const pendingQty =
      selectedItem.pendingQty;

    if (inputQty > pendingQty) {
      setError(
        `Jumlah QC maksimal ${formatNumber(
          pendingQty
        )} pcs.`
      );
      return;
    }

    const currentQC =
      selectedItem.checkedQty;

    const newTotalQC =
      currentQC + inputQty;

    updateItemQC(
      selectedItem.order.id,
      selectedItem.item.id,
      newTotalQC
    );

    handleCloseQC();
  };

  // =====================================================
  // RESET QC
  // =====================================================

  const handleResetQC = (data) => {
    const confirmed = window.confirm(
      `Yakin ingin reset QC item ini?\n\n` +
        `PO: ${
          data.order.poNumber ||
          data.order.id
        }\n` +
        `Customer: ${
          data.order.customer || "-"
        }\n` +
        `Item: ${
          data.item.name || "-"
        }\n` +
        `QC saat ini: ${formatNumber(
          data.checkedQty
        )} pcs\n\n` +
        `QC akan kembali menjadi 0 pcs.\n` +
        `Data produksi tidak akan berubah.\n` +
        `Data item lain juga tidak akan berubah.`
    );

    if (!confirmed) {
      return;
    }

    resetItemQC(
      data.order.id,
      data.item.id
    );

    if (
      selectedItem &&
      String(
        selectedItem.order.id
      ) === String(data.order.id) &&
      String(
        selectedItem.item.id
      ) === String(data.item.id)
    ) {
      handleCloseQC();
    }
  };

  // =====================================================
  // RESET FILTER
  // =====================================================

  const handleResetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
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
            <ClipboardCheck size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quality Control
            </h1>

            <p className="text-sm text-slate-500">
              Periksa dan update hasil QC produksi
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* PO QC */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                PO Dalam QC
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatNumber(
                  summary.totalPO
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                seluruh PO yang sudah produksi
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <ClipboardCheck
                size={22}
                className="text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SUDAH QC */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sudah Lolos QC
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatNumber(
                  summary.checkedQty
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
              <CheckCircle2
                size={22}
                className="text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* BELUM QC */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Belum QC
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatNumber(
                  summary.pendingQty
                )}{" "}
                <span className="text-base font-medium text-slate-400">
                  pcs
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Menunggu pemeriksaan
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
          OVERALL QC
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Overall Quality Control
            </h2>

            <p className="text-sm text-slate-500">
              {formatNumber(
                summary.checkedQty
              )}{" "}
              dari{" "}
              {formatNumber(
                summary.producedQty
              )}{" "}
              pcs sudah lolos QC
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
          QC TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              QC Orders
            </h2>

            <p className="text-sm text-slate-500">
              Update jumlah barang yang sudah lolos QC
            </p>
          </div>

          {/* SEARCH + FILTER */}

          <div className="mt-4 flex flex-col gap-3 lg:flex-row">
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

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="h-10 w-full min-w-[190px] appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="Semua">
                  Semua Status
                </option>

                <option value="Belum Mulai">
                  Belum Mulai
                </option>

                <option value="Berjalan">
                  Berjalan
                </option>

                <option value="Selesai">
                  Selesai
                </option>
              </select>
            </div>
          </div>

          {/* FILTER INFO */}

          {(search ||
            statusFilter !== "Semua") && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {qcItems.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {allQCItems.length}
                </span>{" "}
                item QC
              </p>

              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
              >
                Reset filter
              </button>
            </div>
          )}
        </div>

        {/* EMPTY */}

        {qcItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Search
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Tidak ada item ditemukan
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Tidak ada item produksi yang sesuai
              dengan pencarian atau filter yang dipilih.
            </p>

            {(search ||
              statusFilter !== "Semua") && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-4 text-xs font-medium text-slate-700 hover:underline"
              >
                Reset pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
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
                    Produksi
                  </th>

                  <th className="px-5 py-3 text-center">
                    Lolos QC
                  </th>

                  <th className="px-5 py-3 text-center">
                    Sisa QC
                  </th>

                  <th className="px-5 py-3">
                    Progress
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {qcItems.map((data) => {
                  const {
                    order,
                    item,
                    producedQty,
                    checkedQty,
                    pendingQty,
                    progress,
                    qcStatus,
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

                      {/* PRODUKSI */}

                      <td className="px-5 py-4 text-center text-sm font-semibold text-slate-900">
                        {formatNumber(
                          producedQty
                        )}
                      </td>

                      {/* QC */}

                      <td className="px-5 py-4 text-center text-sm font-semibold text-emerald-600">
                        {formatNumber(
                          checkedQty
                        )}
                      </td>

                      {/* SISA */}

                      <td className="px-5 py-4 text-center">
                        <span
                          className={
                            pendingQty > 0
                              ? "font-semibold text-orange-600"
                              : "font-semibold text-emerald-600"
                          }
                        >
                          {formatNumber(
                            pendingQty
                          )}
                        </span>
                      </td>

                      {/* PROGRESS */}

                      <td className="px-5 py-4">
                        <div className="w-32">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              QC
                            </span>

                            <span className="font-semibold text-slate-900">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-slate-900 transition-all duration-300"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={
                            qcStatus ===
                            "Selesai"
                              ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                              : qcStatus ===
                                "Berjalan"
                              ? "inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                              : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {qcStatus}
                        </span>
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
                              handleOpenQC(
                                data
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                          >
                            <ClipboardCheck
                              size={15}
                            />
                            Update
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleResetQC(
                                data
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                          >
                            <RotateCcw
                              size={15}
                            />
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          UPDATE QC MODAL
      ================================================= */}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Update QC
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedItem.order.poNumber ||
                    selectedItem.order.id}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseQC}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}

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
                      Produksi
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatNumber(
                        selectedItem.producedQty
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Sudah QC
                    </p>

                    <p className="mt-1 font-semibold text-emerald-600">
                      {formatNumber(
                        selectedItem.checkedQty
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Sisa
                    </p>

                    <p className="mt-1 font-semibold text-orange-600">
                      {formatNumber(
                        selectedItem.pendingQty
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Jumlah Lolos QC
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={
                      selectedItem.pendingQty
                    }
                    step="1"
                    value={qcQty}
                    onChange={(e) =>
                      handleQCInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        handleSaveQC();
                      }

                      if (
                        e.key === "Escape"
                      ) {
                        handleCloseQC();
                      }
                    }}
                    autoFocus
                    placeholder="Masukkan jumlah"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-14 text-lg font-semibold outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
                  Maksimal QC tambahan:{" "}
                  {formatNumber(
                    selectedItem.pendingQty
                  )}{" "}
                  pcs
                </p>
              </div>

              {/* PREVIEW */}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Total QC setelah update
                  </span>

                  <span className="font-semibold text-slate-900">
                    {formatNumber(
                      selectedItem.checkedQty +
                        Number(
                          qcQty || 0
                        )
                    )}{" "}
                    /{" "}
                    {formatNumber(
                      selectedItem.producedQty
                    )}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{
                      width: `${
                        selectedItem.producedQty >
                        0
                          ? Math.min(
                              Math.round(
                                ((selectedItem.checkedQty +
                                  Number(
                                    qcQty ||
                                      0
                                  )) /
                                  selectedItem.producedQty) *
                                  100
                              ),
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {selectedItem.checkedQty +
                  Number(qcQty || 0) >=
                  selectedItem.producedQty && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <PackageCheck
                      size={15}
                    />

                    <span>
                      Semua hasil produksi sudah
                      selesai QC.
                    </span>
                  </div>
                )}
              </div>

              {/* RESET */}

              <button
                type="button"
                onClick={() =>
                  handleResetQC(
                    selectedItem
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                <RotateCcw size={16} />
                Reset QC Item Ini
              </button>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={handleCloseQC}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveQC}
                disabled={
                  !qcQty ||
                  Number(qcQty) <= 0
                }
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                Simpan QC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QC;