import { useMemo, useState } from "react";
import {
  Truck,
  PackageCheck,
  FileText,
  Search,
  Eye,
  History,
  RotateCcw,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePO } from "../context/POContext";

export default function Delivery() {
  const {
    orders,
    addShipment,
    resetDelivery,
    getAvailableShipmentQty,
    getItemShippedQty,
  } = usePO();

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [driverName, setDriverName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [showHistory, setShowHistory] = useState(false);
  const [printShipment, setPrintShipment] = useState(null);

  // =====================================================
  // BASIC HELPERS
  // =====================================================

  const getPOName = (order) => {
    if (!order) return "-";

    return (
      order.poNumber ||
      order.poNo ||
      order.number ||
      `PO-${order.id}`
    );
  };

  const getCustomerName = (order) => {
    if (!order) return "-";

    return (
      order.customer ||
      order.company ||
      order.client ||
      "Customer"
    );
  };

  const getItems = (order) => {
    if (!order || !Array.isArray(order.items)) {
      return [];
    }

    return order.items.filter(Boolean);
  };

  const getShipmentHistory = (order) => {
    return order?.delivery?.shipments || [];
  };

  const getQCQty = (item) => {
    return Math.max(
      Number(item?.qc?.passedQty || 0),
      0
    );
  };

  const getShippedQty = (order, item) => {
    if (typeof getItemShippedQty === "function") {
      return Math.max(
        Number(
          getItemShippedQty(
            order,
            item.id
          ) || 0
        ),
        0
      );
    }

    return 0;
  };

  const getReadyQty = (order, item) => {
    return Math.max(
      Number(
        getAvailableShipmentQty(
          order,
          item.id
        ) || 0
      ),
      0
    );
  };

  // =====================================================
  // TOTAL
  // =====================================================

  const getTotalOrderQty = (order) => {
    return getItems(order).reduce(
      (total, item) =>
        total + Number(item.qty || 0),
      0
    );
  };

  const getTotalQCPassed = (order) => {
    return getItems(order).reduce(
      (total, item) =>
        total + getQCQty(item),
      0
    );
  };

  const getTotalReadyQty = (order) => {
    return getItems(order).reduce(
      (total, item) =>
        total + getReadyQty(order, item),
      0
    );
  };

  const getTotalShippedQty = (order) => {
    return getItems(order).reduce(
      (total, item) =>
        total + getShippedQty(order, item),
      0
    );
  };

  // =====================================================
  // STATUS OTOMATIS
  // =====================================================

  const getDeliveryStatus = (order) => {
    const items = getItems(order);

    if (items.length === 0) {
      return "Belum Kirim";
    }

    const totalOrder = getTotalOrderQty(order);
    const totalQC = getTotalQCPassed(order);
    const totalShipped = getTotalShippedQty(order);
    const totalReady = getTotalReadyQty(order);

    // Semua qty PO sudah dikirim
    if (
      totalOrder > 0 &&
      totalShipped >= totalOrder
    ) {
      return "Selesai";
    }

    // Sudah ada pengiriman tetapi belum selesai
    if (totalShipped > 0) {
      return "Terkirim Sebagian";
    }

    // Ada barang QC yang siap dikirim
    if (totalReady > 0) {
      return "Siap Kirim";
    }

    // Belum ada QC
    if (totalQC <= 0) {
      return "Belum Kirim";
    }

    return "Belum Kirim";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Siap Kirim":
        return "bg-blue-50 text-blue-700";

      case "Terkirim Sebagian":
        return "bg-orange-50 text-orange-700";

      case "Terkirim":
        return "bg-emerald-50 text-emerald-700";

      case "Selesai":
        return "bg-green-100 text-green-800";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =====================================================
  // FORMAT
  // =====================================================

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(value || 0)
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const matchesSearch = (order) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    const items = getItems(order);

    return (
      String(getPOName(order))
        .toLowerCase()
        .includes(keyword) ||
      String(getCustomerName(order))
        .toLowerCase()
        .includes(keyword) ||
      items.some((item) => {
        const name =
          item.name ||
          item.itemName ||
          "";

        const code =
          item.code || "";

        return (
          String(name)
            .toLowerCase()
            .includes(keyword) ||
          String(code)
            .toLowerCase()
            .includes(keyword)
        );
      })
    );
  };

  // =====================================================
  // PO SIAP KIRIM
  // =====================================================

  const deliveryOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter((order) => {
      const readyQty = getTotalReadyQty(order);

      return (
        readyQty > 0 &&
        matchesSearch(order)
      );
    });
  }, [
    orders,
    search,
    getAvailableShipmentQty,
  ]);

  // =====================================================
  // SEMUA PO UNTUK STATUS
  // =====================================================

  const statusOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter((order) => {
      if (!matchesSearch(order)) {
        return false;
      }

      const status =
        getDeliveryStatus(order);

      return (
        statusFilter === "Semua" ||
        status === statusFilter
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    getAvailableShipmentQty,
    getItemShippedQty,
  ]);

  // =====================================================
  // SELECTED PO
  // =====================================================

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) {
      return null;
    }

    return (
      orders.find(
        (order) =>
          String(order.id) ===
          String(selectedOrderId)
      ) || null
    );
  }, [
    orders,
    selectedOrderId,
  ]);

  // =====================================================
  // ITEM SELECTED PO
  // =====================================================

  const readyItems = useMemo(() => {
    if (!selectedOrder) {
      return [];
    }

    return getItems(selectedOrder)
      .map((item) => ({
        ...item,
        qcQty: getQCQty(item),
        shippedQty: getShippedQty(
          selectedOrder,
          item
        ),
        readyQty: getReadyQty(
          selectedOrder,
          item
        ),
      }))
      .filter(
        (item) =>
          item.readyQty > 0
      );
  }, [
    selectedOrder,
    getAvailableShipmentQty,
    getItemShippedQty,
  ]);

  // =====================================================
  // SELECTED TOTAL
  // =====================================================

  const selectedItemCount =
    Object.values(selectedItems).filter(
      (qty) => Number(qty || 0) > 0
    ).length;

  const totalSelectedQty =
    Object.values(selectedItems).reduce(
      (total, qty) =>
        total + Number(qty || 0),
      0
    );

  // =====================================================
  // SELECT PO
  // =====================================================

  const handleOrderChange = (event) => {
    const id = event.target.value;

    setSelectedOrderId(id);
    setSelectedItems({});
    setShowHistory(false);
    setPrintShipment(null);
  };

  // =====================================================
  // TOGGLE ITEM
  // =====================================================

  const handleItemToggle = (
    itemId,
    checked
  ) => {
    const item = readyItems.find(
      (currentItem) =>
        String(currentItem.id) ===
        String(itemId)
    );

    if (!item) {
      return;
    }

    setSelectedItems((current) => {
      const next = {
        ...current,
      };

      if (checked) {
        next[itemId] = item.readyQty;
      } else {
        delete next[itemId];
      }

      return next;
    });
  };

  // =====================================================
  // CHANGE QTY
  // =====================================================

  const handleQtyChange = (
    itemId,
    value
  ) => {
    const item = readyItems.find(
      (currentItem) =>
        String(currentItem.id) ===
        String(itemId)
    );

    if (!item) {
      return;
    }

    let qty = Number(value);

    if (Number.isNaN(qty)) {
      qty = 0;
    }

    qty = Math.max(
      0,
      Math.min(
        qty,
        item.readyQty
      )
    );

    setSelectedItems((current) => ({
      ...current,
      [itemId]: qty,
    }));
  };

  // =====================================================
  // CREATE SHIPMENT
  // =====================================================

  const handleCreateShipment = () => {
    if (!selectedOrder) {
      alert("Pilih PO terlebih dahulu.");
      return;
    }

    if (!driverName.trim()) {
      alert("Masukkan nama driver.");
      return;
    }

    if (!deliveryDate) {
      alert("Pilih tanggal pengiriman.");
      return;
    }

    const shipmentItems = Object.entries(
      selectedItems
    )
      .map(([itemId, qty]) => {
        const item = readyItems.find(
          (currentItem) =>
            String(currentItem.id) ===
            String(itemId)
        );

        if (!item) {
          return null;
        }

        const finalQty = Number(qty);

        if (
          finalQty <= 0 ||
          finalQty > item.readyQty
        ) {
          return null;
        }

        return {
          itemId: item.id,
          name:
            item.name ||
            item.itemName ||
            "-",
          code: item.code || "-",
          qty: finalQty,
        };
      })
      .filter(Boolean);

    if (shipmentItems.length === 0) {
      alert(
        "Pilih minimal satu barang untuk dikirim."
      );
      return;
    }

    const shipment = {
      id: Date.now(),
      driverName: driverName.trim(),
      deliveryDate,
      items: shipmentItems,
      status: "Terkirim",
    };

    addShipment(
      selectedOrder.id,
      shipment
    );

    setPrintShipment({
      ...shipment,
      order: selectedOrder,
    });

    setSelectedItems({});
    setShowHistory(false);

    alert(
      "Pengiriman berhasil dibuat."
    );
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const handleResetForm = () => {
    setSelectedItems({});
    setDriverName("");
    setDeliveryDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );
    setPrintShipment(null);
  };

  // =====================================================
  // RESET DELIVERY PO
  // =====================================================

  const handleResetDelivery = (order) => {
    const shippedQty =
      getTotalShippedQty(order);

    if (shippedQty <= 0) {
      alert(
        "PO ini belum memiliki pengiriman."
      );
      return;
    }

    const confirmed = window.confirm(
      `Reset seluruh pengiriman PO ${getPOName(
        order
      )}?\n\n` +
        `Qty terkirim: ${formatNumber(
          shippedQty
        )} pcs\n\n` +
        `Semua shipment PO akan dihapus.\n` +
        `Production dan QC tetap aman.`
    );

    if (!confirmed) {
      return;
    }

    resetDelivery(order.id);

    if (
      String(selectedOrderId) ===
      String(order.id)
    ) {
      setSelectedItems({});
      setPrintShipment(null);
      setShowHistory(false);
    }
  };

  // =====================================================
  // DETAIL
  // =====================================================

  const handleDetail = (order) => {
    navigate(
      `/purchase-orders/${order.id}`
    );
  };

  // =====================================================
  // HISTORY
  // =====================================================

  const handleShowHistory = (order) => {
    setSelectedOrderId(
      String(order.id)
    );

    setSelectedItems({});
    setShowHistory(true);
    setPrintShipment(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // PRINT
  // =====================================================

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Truck size={18} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
              Pengiriman
            </h1>

            <p className="truncate text-xs text-slate-500 sm:text-sm">
              Kirim barang yang sudah lolos QC.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 sm:text-sm">
            Siap Kirim
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {formatNumber(
              orders.filter(
                (order) =>
                  getTotalReadyQty(
                    order
                  ) > 0
              ).length
            )}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            PO
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 sm:text-sm">
            Qty Siap
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-600 sm:text-2xl">
            {formatNumber(
              orders.reduce(
                (total, order) =>
                  total +
                  getTotalReadyQty(
                    order
                  ),
                0
              )
            )}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            pcs
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 sm:text-sm">
            Sebagian
          </p>

          <p className="mt-1 text-xl font-bold text-orange-600 sm:text-2xl">
            {orders.filter(
              (order) =>
                getDeliveryStatus(
                  order
                ) ===
                "Terkirim Sebagian"
            ).length}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            PO
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500 sm:text-sm">
            Selesai
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-600 sm:text-2xl">
            {orders.filter(
              (order) =>
                getDeliveryStatus(
                  order
                ) === "Selesai"
            ).length}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            PO
          </p>
        </div>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
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
            placeholder="Cari PO, customer, barang, kode..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:text-sm"
          />
        </div>
      </div>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
            {/* TITLE */}

            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <PackageCheck
                  size={18}
                  className="text-slate-700"
                />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Pengiriman Barang
                </h2>

                <p className="text-[11px] text-slate-500 sm:text-xs">
                  Hanya barang yang sudah lolos QC.
                </p>
              </div>
            </div>

            {/* SELECT PO */}

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Pilih PO
              </label>

              <select
                value={selectedOrderId}
                onChange={
                  handleOrderChange
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:text-sm"
              >
                <option value="">
                  Pilih PO yang siap dikirim
                </option>

                {deliveryOrders.map(
                  (order) => (
                    <option
                      key={order.id}
                      value={order.id}
                    >
                      {getPOName(
                        order
                      )}{" "}
                      —{" "}
                      {getCustomerName(
                        order
                      )}{" "}
                      — siap{" "}
                      {formatNumber(
                        getTotalReadyQty(
                          order
                        )
                      )}{" "}
                      pcs
                    </option>
                  )
                )}
              </select>

              {deliveryOrders.length ===
                0 && (
                <p className="mt-2 text-[11px] text-slate-400">
                  Tidak ada PO yang memiliki barang siap kirim.
                </p>
              )}
            </div>

            {/* SELECTED PO */}

            {selectedOrder && (
              <>
                {/* INFO */}

                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400">
                      PO
                    </p>

                    <p className="mt-0.5 truncate text-xs font-bold text-slate-900">
                      {getPOName(
                        selectedOrder
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400">
                      Customer
                    </p>

                    <p className="mt-0.5 truncate text-xs font-bold text-slate-900">
                      {getCustomerName(
                        selectedOrder
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                        getDeliveryStatus(
                          selectedOrder
                        )
                      )}`}
                    >
                      {getDeliveryStatus(
                        selectedOrder
                      )}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400">
                      Terkirim
                    </p>

                    <p className="mt-0.5 text-xs font-bold text-slate-900">
                      {formatNumber(
                        getTotalShippedQty(
                          selectedOrder
                        )
                      )}{" "}
                      pcs
                    </p>
                  </div>
                </div>

                {/* ACTION */}

                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDetail(
                        selectedOrder
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={14} />
                    Detail PO
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowHistory(
                        (value) =>
                          !value
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <History size={14} />

                    {showHistory
                      ? "Tutup Riwayat"
                      : "Riwayat"}
                  </button>
                </div>

                {/* HISTORY */}

                {showHistory && (
                  <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <History
                        size={15}
                        className="text-slate-600"
                      />

                      <h3 className="text-xs font-bold text-slate-900">
                        Riwayat Pengiriman
                      </h3>
                    </div>

                    {getShipmentHistory(
                      selectedOrder
                    ).length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Belum ada pengiriman.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {getShipmentHistory(
                          selectedOrder
                        )
                          .slice()
                          .reverse()
                          .map(
                            (
                              shipment,
                              index
                            ) => (
                              <div
                                key={
                                  shipment.id ||
                                  index
                                }
                                className="rounded-lg border border-slate-200 bg-white p-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-900">
                                      SJ-
                                      {shipment.id}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                      {
                                        shipment.driverName
                                      }{" "}
                                      •{" "}
                                      {formatDate(
                                        shipment.deliveryDate
                                      )}
                                    </p>
                                  </div>

                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                                    Terkirim
                                  </span>
                                </div>

                                <div className="mt-2 space-y-1">
                                  {(
                                    shipment.items ||
                                    []
                                  ).map(
                                    (
                                      item
                                    ) => (
                                      <div
                                        key={`${shipment.id}-${item.itemId}`}
                                        className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5"
                                      >
                                        <div className="min-w-0">
                                          <p className="truncate text-[11px] font-medium text-slate-800">
                                            {
                                              item.name
                                            }
                                          </p>

                                          <p className="text-[9px] text-slate-400">
                                            {
                                              item.code
                                            }
                                          </p>
                                        </div>

                                        <span className="shrink-0 text-xs font-bold text-slate-900">
                                          {formatNumber(
                                            item.qty
                                          )}{" "}
                                          pcs
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* READY ITEMS */}

                {readyItems.length ===
                0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                    <CheckCircle2
                      size={28}
                      className="mx-auto text-emerald-400"
                    />

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Tidak ada barang siap kirim
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Semua barang yang sudah lolos QC telah dikirim.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {readyItems.map(
                      (item) => {
                        const checked =
                          selectedItems[
                            item.id
                          ] !== undefined;

                        return (
                          <div
                            key={
                              item.id
                            }
                            className={`rounded-lg border p-3 transition ${
                              checked
                                ? "border-slate-400 bg-slate-50"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleItemToggle(
                                    item.id,
                                    event
                                      .target
                                      .checked
                                  )
                                }
                                className="mt-1 h-4 w-4"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                                      {item.name ||
                                        item.itemName ||
                                        "-"}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                      {item.code ||
                                        "-"}
                                    </p>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                    Siap{" "}
                                    {formatNumber(
                                      item.readyQty
                                    )}
                                  </span>
                                </div>

                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  <div>
                                    <p className="text-[9px] text-slate-400">
                                      QC
                                    </p>

                                    <p className="text-xs font-semibold text-slate-700">
                                      {formatNumber(
                                        item.qcQty
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[9px] text-slate-400">
                                      Terkirim
                                    </p>

                                    <p className="text-xs font-semibold text-slate-700">
                                      {formatNumber(
                                        item.shippedQty
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[9px] text-slate-400">
                                      Kirim
                                    </p>

                                    <input
                                      type="number"
                                      min="0"
                                      max={
                                        item.readyQty
                                      }
                                      step="1"
                                      disabled={
                                        !checked
                                      }
                                      value={
                                        checked
                                          ? selectedItems[
                                              item.id
                                            ]
                                          : ""
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleQtyChange(
                                          item.id,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="mt-0.5 h-8 w-full rounded-md border border-slate-200 px-2 text-center text-xs outline-none focus:border-slate-500 disabled:bg-slate-100"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </>
            )}

            {/* EMPTY */}

            {!selectedOrder && (
              <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center">
                <PackageCheck
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Pilih PO terlebih dahulu
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Hanya PO yang memiliki barang lolos QC dan belum terkirim penuh yang muncul.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            RIGHT - SURAT JALAN
        ================================================= */}

        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5 lg:sticky lg:top-20">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <FileText
                  size={18}
                  className="text-slate-700"
                />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Surat Jalan
                </h2>

                <p className="text-[11px] text-slate-500">
                  Buat dokumen pengiriman.
                </p>
              </div>
            </div>

            {/* DRIVER */}

            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Nama Driver
              </label>

              <input
                type="text"
                value={driverName}
                onChange={(event) =>
                  setDriverName(
                    event.target.value
                  )
                }
                placeholder="Nama driver"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:text-sm"
              />
            </div>

            {/* DATE */}

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Tanggal
              </label>

              <input
                type="date"
                value={deliveryDate}
                onChange={(event) =>
                  setDeliveryDate(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 sm:text-sm"
              />
            </div>

            {/* SUMMARY */}

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Item dipilih
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {selectedItemCount}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Total dikirim
                </span>

                <span className="text-base font-bold text-slate-900">
                  {formatNumber(
                    totalSelectedQty
                  )}{" "}
                  pcs
                </span>
              </div>
            </div>

            {/* CREATE */}

            <button
              type="button"
              onClick={
                handleCreateShipment
              }
              disabled={
                !selectedOrder ||
                selectedItemCount ===
                  0 ||
                !driverName.trim()
              }
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:text-sm"
            >
              <FileText size={16} />
              Buat Surat Jalan
            </button>

            {/* RESET FORM */}

            <button
              type="button"
              onClick={
                handleResetForm
              }
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Reset Form
            </button>

            {/* PRINT */}

            {printShipment && (
              <>
                <button
                  type="button"
                  onClick={
                    handlePrint
                  }
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-700 text-xs font-semibold text-white hover:bg-slate-800 sm:h-11 sm:text-sm"
                >
                  <Printer size={16} />
                  Print Surat Jalan
                </button>

                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <p className="text-xs font-semibold text-emerald-800">
                        Surat jalan berhasil dibuat
                      </p>

                      <p className="mt-0.5 text-[10px] text-emerald-700">
                        SJ-
                        {
                          printShipment.id
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          STATUS SEMUA PO
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3 sm:p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Status Pengiriman
            </h2>

            <p className="text-[11px] text-slate-500 sm:text-xs">
              Status mengikuti progress pengiriman.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none sm:px-3 sm:text-xs"
          >
            <option value="Semua">
              Semua
            </option>

            <option value="Belum Kirim">
              Belum Kirim
            </option>

            <option value="Siap Kirim">
              Siap Kirim
            </option>

            <option value="Terkirim Sebagian">
              Terkirim Sebagian
            </option>

            <option value="Selesai">
              Selesai
            </option>
          </select>
        </div>

        {/* MOBILE */}

        <div className="space-y-2.5 p-3 sm:hidden">
          {statusOrders.length ===
          0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada PO.
            </div>
          ) : (
            statusOrders.map(
              (order) => {
                const status =
                  getDeliveryStatus(
                    order
                  );

                const ready =
                  getTotalReadyQty(
                    order
                  );

                const shipped =
                  getTotalShippedQty(
                    order
                  );

                return (
                  <div
                    key={
                      order.id
                    }
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleDetail(
                              order
                            )
                          }
                          className="text-xs font-bold text-slate-900 hover:underline"
                        >
                          {getPOName(
                            order
                          )}
                        </button>

                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {getCustomerName(
                            order
                          )}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-slate-50 p-2">
                        <p className="text-[9px] text-slate-400">
                          Siap
                        </p>

                        <p className="text-xs font-bold text-emerald-600">
                          {formatNumber(
                            ready
                          )}{" "}
                          pcs
                        </p>
                      </div>

                      <div className="rounded-md bg-slate-50 p-2">
                        <p className="text-[9px] text-slate-400">
                          Terkirim
                        </p>

                        <p className="text-xs font-bold text-slate-800">
                          {formatNumber(
                            shipped
                          )}{" "}
                          pcs
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex gap-2">
                      {shipped >
                        0 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleResetDelivery(
                              order
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-[10px] font-medium text-red-600 hover:bg-red-50"
                        >
                          <RotateCcw
                            size={12}
                          />
                          Reset
                        </button>
                      )}

                      {shipped >
                        0 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleShowHistory(
                              order
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-700"
                        >
                          <History
                            size={12}
                          />
                          Riwayat
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDetail(
                            order
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-900 px-2 py-2 text-[10px] font-medium text-white"
                      >
                        <Eye
                          size={12}
                        />
                        Detail
                      </button>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>

        {/* DESKTOP */}

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">
                  PO
                </th>

                <th className="px-5 py-3">
                  Customer
                </th>

                <th className="px-5 py-3 text-center">
                  Siap Kirim
                </th>

                <th className="px-5 py-3 text-center">
                  Terkirim
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
              {statusOrders.map(
                (order) => {
                  const status =
                    getDeliveryStatus(
                      order
                    );

                  const ready =
                    getTotalReadyQty(
                      order
                    );

                  const shipped =
                    getTotalShippedQty(
                      order
                    );

                  return (
                    <tr
                      key={
                        order.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleDetail(
                              order
                            )
                          }
                          className="text-sm font-semibold text-slate-900 hover:underline"
                        >
                          {getPOName(
                            order
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3 text-sm text-slate-700">
                        {getCustomerName(
                          order
                        )}
                      </td>

                      <td className="px-5 py-3 text-center text-sm font-semibold text-emerald-600">
                        {formatNumber(
                          ready
                        )}
                      </td>

                      <td className="px-5 py-3 text-center text-sm font-semibold text-slate-800">
                        {formatNumber(
                          shipped
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {shipped >
                            0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleResetDelivery(
                                  order
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <RotateCcw
                                size={14}
                              />
                              Reset
                            </button>
                          )}

                          {shipped >
                            0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleShowHistory(
                                  order
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <History
                                size={14}
                              />
                              Riwayat
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDetail(
                                order
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            <Eye
                              size={14}
                            />
                            Detail
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
      </div>

      {/* =================================================
          PRINT AREA
      ================================================= */}

      {printShipment && (
        <div className="print-area">
          <div className="surat-jalan">
            <div className="sj-header">
              <div>
                <h1>SURAT JALAN</h1>

                <p>
                  Nomor: SJ-
                  {
                    printShipment.id
                  }
                </p>
              </div>

              <div className="sj-company">
                <strong>
                  PERUSAHAAN ANDA
                </strong>

                <span>
                  Alamat Perusahaan
                </span>

                <span>
                  Telp. 08xxxxxxxxxx
                </span>
              </div>
            </div>

            <hr />

            <div className="sj-info">
              <div>
                <span>
                  Kepada
                </span>

                <strong>
                  {getCustomerName(
                    printShipment.order
                  )}
                </strong>
              </div>

              <div>
                <span>
                  No. PO
                </span>

                <strong>
                  {getPOName(
                    printShipment.order
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Tanggal
                </span>

                <strong>
                  {formatDate(
                    printShipment.deliveryDate
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Driver
                </span>

                <strong>
                  {
                    printShipment.driverName
                  }
                </strong>
              </div>
            </div>

            <table className="sj-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Barang</th>
                  <th>Kode Barang</th>
                  <th>Qty</th>
                </tr>
              </thead>

              <tbody>
                {printShipment.items.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={`${printShipment.id}-${item.itemId}`}
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {item.name}
                      </td>

                      <td>
                        {item.code}
                      </td>

                      <td>
                        {formatNumber(
                          item.qty
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="sj-total">
              <strong>
                Total Qty
              </strong>

              <strong>
                {formatNumber(
                  printShipment.items.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.qty ||
                          0
                      ),
                    0
                  )
                )}
              </strong>
            </div>

            <div className="sj-note">
              <strong>
                Catatan:
              </strong>

              <p>
                Barang telah diperiksa dan
                dinyatakan siap untuk dikirim.
              </p>
            </div>

            <div className="sj-signature">
              <div>
                <p>
                  Driver
                </p>

                <div className="signature-space" />

                <strong>
                  {
                    printShipment.driverName
                  }
                </strong>
              </div>

              <div>
                <p>
                  Pengirim
                </p>

                <div className="signature-space" />

                <strong>
                  __________________
                </strong>
              </div>

              <div>
                <p>
                  Penerima
                </p>

                <div className="signature-space" />

                <strong>
                  __________________
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          PRINT CSS
      ================================================= */}

      <style>{`
        .print-area {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          @page {
            size: A4;
            margin: 15mm;
          }

          .surat-jalan {
            width: 100%;
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            font-size: 12px;
          }

          .sj-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .sj-header h1 {
            margin: 0 0 6px;
            font-size: 25px;
            letter-spacing: 1px;
          }

          .sj-header p {
            margin: 0;
            font-size: 12px;
          }

          .sj-company {
            display: flex;
            flex-direction: column;
            text-align: right;
            gap: 3px;
          }

          .sj-company strong {
            font-size: 16px;
          }

          .sj-company span {
            font-size: 11px;
          }

          .sj-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }

          .sj-info div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .sj-info span {
            font-size: 10px;
            color: #555;
            text-transform: uppercase;
          }

          .sj-info strong {
            font-size: 12px;
          }

          .sj-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          .sj-table th,
          .sj-table td {
            border: 1px solid #000;
            padding: 9px;
          }

          .sj-table th {
            background: #f1f1f1 !important;
            text-align: center;
            font-weight: bold;
          }

          .sj-table td:first-child,
          .sj-table td:last-child {
            text-align: center;
          }

          .sj-total {
            display: flex;
            justify-content: flex-end;
            gap: 80px;
            margin-top: 12px;
            padding-right: 10px;
          }

          .sj-note {
            margin-top: 35px;
          }

          .sj-note p {
            margin-top: 6px;
          }

          .sj-signature {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 70px;
            text-align: center;
          }

          .sj-signature p {
            margin: 0;
          }

          .signature-space {
            height: 60px;
          }

          .sj-signature strong {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}