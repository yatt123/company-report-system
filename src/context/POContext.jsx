import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { orders as initialOrders } from "../data/orders";

const POContext = createContext(null);

const STORAGE_KEY = "company-report-orders";

const WORKFLOW_STATUSES = [
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

/* =========================================================
   HELPERS
========================================================= */

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeItem = (item, index = 0) => {
  const qty = Math.max(safeNumber(item?.qty), 0);

  const productionQty = Math.min(
    Math.max(
      safeNumber(item?.production?.completedQty),
      0
    ),
    qty
  );

  const qcQty = Math.min(
    Math.max(
      safeNumber(
        item?.qc?.passedQty ??
          item?.qc?.checkedQty
      ),
      0
    ),
    productionQty
  );

  return {
    ...item,

    id:
      item?.id ??
      `item-${index + 1}`,

    qty,

    price: safeNumber(
      item?.price ??
        item?.unitPrice
    ),

    unitPrice: safeNumber(
      item?.unitPrice ??
        item?.price
    ),

    production: {
      ...(item?.production || {}),
      completedQty: productionQty,
    },

    qc: {
      ...(item?.qc || {}),
      passedQty: qcQty,
    },
  };
};

const normalizeOrder = (
  order,
  index = 0
) => {
  const items = Array.isArray(order?.items)
    ? order.items.map(
        (item, itemIndex) =>
          normalizeItem(
            item,
            itemIndex
          )
      )
    : [];

  return {
    ...order,

    id:
      order?.id ??
      `order-${index + 1}`,

    poNumber:
      order?.poNumber ??
      `PO ${String(index + 1).padStart(3, "0")}`,

    status:
      order?.status ??
      "Order Masuk",

    items,

    delivery: {
      ...(order?.delivery || {}),

      shipments: Array.isArray(
        order?.delivery?.shipments
      )
        ? order.delivery.shipments
        : [],
    },
  };
};

/* =========================================================
   TOTAL ORDER
========================================================= */

const getTotalOrderQty = (order) => {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce(
    (total, item) =>
      total +
      safeNumber(item?.qty),
    0
  );
};

/* =========================================================
   TOTAL PRODUCTION
========================================================= */

const getTotalProductionQty = (order) => {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce(
    (total, item) =>
      total +
      safeNumber(
        item?.production?.completedQty
      ),
    0
  );
};

const getTotalProductionRemaining = (order) => {
  const totalOrderQty =
    getTotalOrderQty(order);

  const totalProductionQty =
    getTotalProductionQty(order);

  return Math.max(
    totalOrderQty -
      totalProductionQty,
    0
  );
};

/* =========================================================
   TOTAL QC
========================================================= */

const getTotalQCQty = (order) => {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce(
    (total, item) =>
      total +
      safeNumber(
        item?.qc?.passedQty ??
          item?.qc?.checkedQty
      ),
    0
  );
};

const getTotalQCPassedQty = (order) => {
  return getTotalQCQty(order);
};

const getTotalQCPending = (order) => {
  const totalOrderQty =
    getTotalOrderQty(order);

  const totalQCPassedQty =
    getTotalQCPassedQty(order);

  return Math.max(
    totalOrderQty -
      totalQCPassedQty,
    0
  );
};

/* =========================================================
   TOTAL SHIPPED
========================================================= */

const getTotalShippedQty = (order) => {
  const shipments =
    order?.delivery?.shipments;

  if (!Array.isArray(shipments)) {
    return 0;
  }

  return shipments.reduce(
    (total, shipment) => {
      /*
        Format normal:
        shipment.items = [
          {
            itemId,
            qty
          }
        ]
      */

      if (
        Array.isArray(
          shipment?.items
        )
      ) {
        return (
          total +
          shipment.items.reduce(
            (sum, item) =>
              sum +
              safeNumber(
                item?.qty
              ),
            0
          )
        );
      }

      /*
        Format lama:
        shipment.qty
      */

      return (
        total +
        safeNumber(
          shipment?.qty
        )
      );
    },
    0
  );
};

/* =========================================================
   LOCK
========================================================= */

const isOrderLocked = (order) => {
  if (!order) {
    return false;
  }

  /*
    Kalau sudah Selesai,
    PO benar-benar terkunci.
  */

  if (
    order.status === "Selesai"
  ) {
    return true;
  }

  const totalOrderQty =
    getTotalOrderQty(order);

  const totalShippedQty =
    getTotalShippedQty(order);

  return (
    totalOrderQty > 0 &&
    totalShippedQty >=
      totalOrderQty
  );
};

/* =========================================================
   AUTOMATIC STATUS
========================================================= */

const calculateAutomaticStatus = (
  order
) => {
  if (!order) {
    return "Order Masuk";
  }

  const totalOrderQty =
    getTotalOrderQty(order);

  const totalProductionQty =
    getTotalProductionQty(order);

  const totalQCQty =
    getTotalQCQty(order);

  const totalShippedQty =
    getTotalShippedQty(order);

  if (totalOrderQty <= 0) {
    return "Order Masuk";
  }

  /*
    FULL DELIVERY
  */

  if (
    totalShippedQty >=
    totalOrderQty
  ) {
    return "Selesai";
  }

  /*
    PARTIAL DELIVERY
  */

  if (totalShippedQty > 0) {
    return "Terkirim Sebagian";
  }

  /*
    FULL QC
  */

  if (
    totalQCQty >=
    totalOrderQty
  ) {
    return "Siap Kirim";
  }

  /*
    FULL PRODUCTION
  */

  if (
    totalProductionQty >=
    totalOrderQty
  ) {
    return "QC";
  }

  /*
    PARTIAL PRODUCTION
  */

  if (
    totalProductionQty > 0
  ) {
    return "Produksi";
  }

  return "Order Masuk";
};

/* =========================================================
   PROVIDER
========================================================= */

export function POProvider({
  children,
}) {
  const [orders, setOrders] =
    useState(() => {
      try {
        const savedOrders =
          localStorage.getItem(
            STORAGE_KEY
          );

        /*
          Kalau localStorage berisi [],
          jangan fallback ke demo data.
        */

        if (
          savedOrders !== null
        ) {
          const parsedOrders =
            JSON.parse(
              savedOrders
            );

          if (
            Array.isArray(
              parsedOrders
            )
          ) {
            return parsedOrders.map(
              normalizeOrder
            );
          }
        }
      } catch (error) {
        console.error(
          "Gagal membaca data PO:",
          error
        );
      }

      /*
        Kalau belum ada localStorage,
        gunakan data demo.
      */

      return Array.isArray(
        initialOrders
      )
        ? initialOrders.map(
            normalizeOrder
          )
        : [];
    });

  /* =======================================================
     SAVE LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan data PO:",
        error
      );
    }
  }, [orders]);

  /* =======================================================
     ADD ORDER
  ======================================================= */

  const addOrder = useCallback(
    (newOrder) => {
      const normalizedOrder =
        normalizeOrder(
          newOrder,
          orders.length
        );

      normalizedOrder.status =
        calculateAutomaticStatus(
          normalizedOrder
        );

      setOrders(
        (currentOrders) => [
          ...currentOrders,
          normalizedOrder,
        ]
      );

      return normalizedOrder;
    },
    [orders.length]
  );

  /* =======================================================
     UPDATE ORDER
  ======================================================= */

  const updateOrder =
    useCallback(
      (orderId, updates) => {
        let updatedOrder = null;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                /*
                  PO terkunci tidak boleh
                  diubah lagi.
                */

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                updatedOrder = {
                  ...order,
                  ...updates,
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                return updatedOrder;
              }
            )
        );

        return updatedOrder;
      },
      []
    );

  /* =======================================================
     DELETE ORDER
  ======================================================= */

  const deleteOrder =
    useCallback(
      (orderId) => {
        let deleted = false;

        setOrders(
          (currentOrders) => {
            const targetOrder =
              currentOrders.find(
                (order) =>
                  String(
                    order.id
                  ) ===
                  String(orderId)
              );

            if (!targetOrder) {
              return currentOrders;
            }

            if (
              isOrderLocked(
                targetOrder
              )
            ) {
              return currentOrders;
            }

            deleted = true;

            return currentOrders.filter(
              (order) =>
                String(
                  order.id
                ) !==
                String(orderId)
            );
          }
        );

        return deleted;
      },
      []
    );

  /* =======================================================
     UPDATE PRODUCTION ITEM
  ======================================================= */

  const updateItemProduction =
    useCallback(
      (
        orderId,
        itemId,
        completedQty
      ) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                /*
                  Kalau PO sudah selesai /
                  full delivery,
                  production tidak boleh
                  diedit.
                */

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const newItems =
                  order.items.map(
                    (item) => {
                      if (
                        String(
                          item.id
                        ) !==
                        String(itemId)
                      ) {
                        return item;
                      }

                      const orderQty =
                        safeNumber(
                          item.qty
                        );

                      const newQty =
                        Math.min(
                          Math.max(
                            safeNumber(
                              completedQty
                            ),
                            0
                          ),
                          orderQty
                        );

                      const currentQC =
                        safeNumber(
                          item.qc
                            ?.passedQty
                        );

                      /*
                        QC tidak boleh lebih
                        besar dari production.
                      */

                      const newQC =
                        Math.min(
                          currentQC,
                          newQty
                        );

                      success = true;

                      return {
                        ...item,

                        production: {
                          ...(item.production ||
                            {}),
                          completedQty:
                            newQty,
                        },

                        qc: {
                          ...(item.qc ||
                            {}),
                          passedQty:
                            newQC,
                        },
                      };
                    }
                  );

                const updatedOrder = {
                  ...order,
                  items: newItems,
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                return updatedOrder;
              }
            )
        );

        return success;
      },
      []
    );

  const updateProduction =
    updateItemProduction;

  /* =======================================================
     RESET PRODUCTION ITEM
  ======================================================= */

  const resetItemProduction =
    useCallback(
      (orderId, itemId) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const newItems =
                  order.items.map(
                    (item) => {
                      if (
                        String(
                          item.id
                        ) !==
                        String(itemId)
                      ) {
                        return item;
                      }

                      success = true;

                      return {
                        ...item,

                        production: {
                          ...(item.production ||
                            {}),
                          completedQty: 0,
                        },

                        qc: {
                          ...(item.qc ||
                            {}),
                          passedQty: 0,
                        },
                      };
                    }
                  );

                const updatedOrder = {
                  ...order,
                  items: newItems,
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                return updatedOrder;
              }
            )
        );

        return success;
      },
      []
    );

  /* =======================================================
     UPDATE QC ITEM
  ======================================================= */

  const updateItemQC =
    useCallback(
      (
        orderId,
        itemId,
        passedQty
      ) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const newItems =
                  order.items.map(
                    (item) => {
                      if (
                        String(
                          item.id
                        ) !==
                        String(itemId)
                      ) {
                        return item;
                      }

                      const productionQty =
                        safeNumber(
                          item.production
                            ?.completedQty
                        );

                      const newQC =
                        Math.min(
                          Math.max(
                            safeNumber(
                              passedQty
                            ),
                            0
                          ),
                          productionQty
                        );

                      success = true;

                      return {
                        ...item,

                        qc: {
                          ...(item.qc ||
                            {}),
                          passedQty:
                            newQC,
                        },
                      };
                    }
                  );

                const updatedOrder = {
                  ...order,
                  items: newItems,
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                return updatedOrder;
              }
            )
        );

        return success;
      },
      []
    );

  const updateQC =
    updateItemQC;

  /* =======================================================
     RESET QC ITEM
  ======================================================= */

  const resetItemQC =
    useCallback(
      (orderId, itemId) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const newItems =
                  order.items.map(
                    (item) => {
                      if (
                        String(
                          item.id
                        ) !==
                        String(itemId)
                      ) {
                        return item;
                      }

                      success = true;

                      return {
                        ...item,

                        qc: {
                          ...(item.qc ||
                            {}),
                          passedQty: 0,
                        },
                      };
                    }
                  );

                const updatedOrder = {
                  ...order,
                  items: newItems,
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                return updatedOrder;
              }
            )
        );

        return success;
      },
      []
    );

  /* =======================================================
     ITEM SHIPPED QTY
  ======================================================= */

  const getItemShippedQty =
    useCallback(
      (order, itemId) => {
        const shipments =
          Array.isArray(
            order?.delivery
              ?.shipments
          )
            ? order.delivery
                .shipments
            : [];

        return shipments.reduce(
          (
            total,
            shipment
          ) => {
            /*
              Format utama
            */

            if (
              Array.isArray(
                shipment?.items
              )
            ) {
              return (
                total +
                shipment.items.reduce(
                  (
                    itemTotal,
                    shipmentItem
                  ) => {
                    if (
                      String(
                        shipmentItem?.itemId
                      ) !==
                      String(itemId)
                    ) {
                      return itemTotal;
                    }

                    return (
                      itemTotal +
                      safeNumber(
                        shipmentItem?.qty
                      )
                    );
                  },
                  0
                )
              );
            }

            /*
              Fallback format lama
            */

            if (
              String(
                shipment?.itemId
              ) ===
              String(itemId)
            ) {
              return (
                total +
                safeNumber(
                  shipment?.qty
                )
              );
            }

            return total;
          },
          0
        );
      },
      []
    );

  /* =======================================================
     AVAILABLE SHIPMENT QTY
  ======================================================= */

  const getAvailableShipmentQty =
    useCallback(
      (order, itemId) => {
        if (!order) {
          return 0;
        }

        const item =
          Array.isArray(
            order.items
          )
            ? order.items.find(
                (currentItem) =>
                  String(
                    currentItem.id
                  ) ===
                  String(itemId)
              )
            : null;

        if (!item) {
          return 0;
        }

        const qcQty =
          safeNumber(
            item?.qc?.passedQty
          );

        const shippedQty =
          getItemShippedQty(
            order,
            itemId
          );

        return Math.max(
          qcQty -
            shippedQty,
          0
        );
      },
      [getItemShippedQty]
    );

  /* =======================================================
     ADD SHIPMENT
  ======================================================= */

  const addShipment =
    useCallback(
      (
        orderId,
        shipment
      ) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                /*
                  PO terkunci tidak bisa
                  menerima delivery baru.
                */

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const currentShipments =
                  Array.isArray(
                    order.delivery
                      ?.shipments
                  )
                    ? order.delivery
                        .shipments
                    : [];

                if (
                  !Array.isArray(
                    shipment?.items
                  ) ||
                  shipment.items.length ===
                    0
                ) {
                  return order;
                }

                /*
                  Validasi setiap item:
                  Delivery tidak boleh lebih
                  besar dari QC - yang sudah
                  dikirim.
                */

                for (
                  const shipmentItem of shipment.items
                ) {
                  const availableQty =
                    getAvailableShipmentQty(
                      order,
                      shipmentItem.itemId
                    );

                  const requestedQty =
                    safeNumber(
                      shipmentItem.qty
                    );

                  if (
                    requestedQty <= 0 ||
                    requestedQty >
                      availableQty
                  ) {
                    return order;
                  }
                }

                const newShipment = {
                  id:
                    shipment?.id ??
                    Date.now(),

                  date:
                    shipment?.date ??
                    new Date().toISOString(),

                  ...shipment,
                };

                const updatedOrder = {
                  ...order,

                  delivery: {
                    ...(order.delivery ||
                      {}),

                    shipments: [
                      ...currentShipments,
                      newShipment,
                    ],
                  },
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                success = true;

                return updatedOrder;
              }
            )
        );

        return success;
      },
      [getAvailableShipmentQty]
    );

  /* =======================================================
     DELETE SHIPMENT
  ======================================================= */

  const deleteShipment =
    useCallback(
      (
        orderId,
        shipmentId
      ) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                /*
                  Kalau sudah selesai,
                  shipment tidak boleh
                  dihapus.
                */

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const shipments =
                  Array.isArray(
                    order.delivery
                      ?.shipments
                  )
                    ? order.delivery
                        .shipments
                    : [];

                const newShipments =
                  shipments.filter(
                    (shipment) =>
                      String(
                        shipment.id
                      ) !==
                      String(
                        shipmentId
                      )
                  );

                if (
                  newShipments.length ===
                  shipments.length
                ) {
                  return order;
                }

                const updatedOrder = {
                  ...order,

                  delivery: {
                    ...(order.delivery ||
                      {}),

                    shipments:
                      newShipments,
                  },
                };

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                success = true;

                return updatedOrder;
              }
            )
        );

        return success;
      },
      []
    );

  /* =======================================================
     RESET DELIVERY
     
     HANYA menghapus delivery.
     
     Production aman.
     QC aman.
  ======================================================= */

  const resetDelivery =
    useCallback(
      (orderId) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                /*
                  PO selesai tidak boleh
                  di-reset.
                */

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const updatedOrder = {
                  ...order,

                  delivery: {
                    ...(order.delivery ||
                      {}),

                    shipments: [],
                  },
                };

                /*
                  Production dan QC
                  TIDAK disentuh.
                */

                updatedOrder.status =
                  calculateAutomaticStatus(
                    updatedOrder
                  );

                success = true;

                return updatedOrder;
              }
            )
        );

        return success;
      },
      []
    );

  /* =======================================================
     RESET ONE PO
     
     Reset:
     - Production
     - QC
     - Delivery
  ======================================================= */

  const resetOrder =
    useCallback(
      (orderId) => {
        let success = false;

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  String(
                    order.id
                  ) !==
                  String(orderId)
                ) {
                  return order;
                }

                /*
                  PO selesai tetap terkunci.
                */

                if (
                  isOrderLocked(order)
                ) {
                  return order;
                }

                const resetItems =
                  order.items.map(
                    (item) => ({
                      ...item,

                      production: {
                        ...(item.production ||
                          {}),
                        completedQty: 0,
                      },

                      qc: {
                        ...(item.qc ||
                          {}),
                        passedQty: 0,
                      },
                    })
                  );

                success = true;

                return {
                  ...order,

                  items: resetItems,

                  delivery: {
                    ...(order.delivery ||
                      {}),

                    shipments: [],
                  },

                  status:
                    "Order Masuk",
                };
              }
            )
        );

        return success;
      },
      []
    );

  /* =======================================================
     RESET DEMO 20 PO
  ======================================================= */

  const resetToDemoData =
    useCallback(() => {
      try {
        const demoOrders =
          Array.isArray(
            initialOrders
          )
            ? initialOrders.map(
                (
                  order,
                  index
                ) => {
                  const normalized =
                    normalizeOrder(
                      order,
                      index
                    );

                  const resetItems =
                    normalized.items.map(
                      (item) => ({
                        ...item,

                        production: {
                          ...(item.production ||
                            {}),
                          completedQty: 0,
                        },

                        qc: {
                          ...(item.qc ||
                            {}),
                          passedQty: 0,
                        },
                      })
                    );

                  const demoOrder = {
                    ...normalized,

                    items:
                      resetItems,

                    delivery: {
                      ...(normalized.delivery ||
                        {}),

                      shipments: [],
                    },

                    status:
                      "Order Masuk",
                  };

                  return {
                    ...demoOrder,

                    status:
                      calculateAutomaticStatus(
                        demoOrder
                      ),
                  };
                }
              )
            : [];

        setOrders(
          demoOrders
        );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            demoOrders
          )
        );

        return true;
      } catch (error) {
        console.error(
          "Gagal reset demo:",
          error
        );

        return false;
      }
    }, []);

  /* =======================================================
     CLEAR ALL ORDERS
  ======================================================= */

  const clearAllOrders =
    useCallback(() => {
      try {
        /*
          Penting:
          SIMPAN [] ke localStorage.

          Jangan pakai removeItem(),
          karena nanti saat reload akan
          balik ke 20 PO demo.
        */

        setOrders([]);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([])
        );

        return true;
      } catch (error) {
        console.error(
          "Gagal menghapus semua PO:",
          error
        );

        return false;
      }
    }, []);

  /* =======================================================
     GET ORDER BY ID
  ======================================================= */

  const getOrderById =
    useCallback(
      (orderId) => {
        return orders.find(
          (order) =>
            String(
              order.id
            ) ===
            String(orderId)
        );
      },
      [orders]
    );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const totalPO =
      orders.length;

    const orderMasuk =
      orders.filter(
        (order) =>
          order.status ===
          "Order Masuk"
      ).length;

    const cekMaterial =
      orders.filter(
        (order) =>
          order.status ===
          "Cek Material"
      ).length;

    const produksi =
      orders.filter(
        (order) =>
          order.status ===
          "Produksi"
      ).length;

    const qc =
      orders.filter(
        (order) =>
          order.status ===
          "QC"
      ).length;

    const packing =
      orders.filter(
        (order) =>
          order.status ===
          "Packing"
      ).length;

    const siapKirim =
      orders.filter(
        (order) =>
          order.status ===
          "Siap Kirim"
      ).length;

    const terkirimSebagian =
      orders.filter(
        (order) =>
          order.status ===
          "Terkirim Sebagian"
      ).length;

    const terkirim =
      orders.filter(
        (order) =>
          order.status ===
          "Terkirim"
      ).length;

    const selesai =
      orders.filter(
        (order) =>
          order.status ===
          "Selesai"
      ).length;

    const totalValue =
      orders.reduce(
        (total, order) =>
          total +
          safeNumber(
            order.totalValue
          ),
        0
      );

    return {
      totalPO,

      orderMasuk,
      cekMaterial,
      produksi,
      qc,
      packing,
      siapKirim,
      terkirimSebagian,
      terkirim,
      selesai,

      totalValue,
    };
  }, [orders]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      /*
        DATA
      */

      orders,
      setOrders,
      stats,

      WORKFLOW_STATUSES,

      /*
        ORDER
      */

      addOrder,
      updateOrder,
      deleteOrder,
      getOrderById,

      /*
        PRODUCTION
      */

      updateProduction,
      updateItemProduction,
      resetItemProduction,

      /*
        QC
      */

      updateQC,
      updateItemQC,
      resetItemQC,

      /*
        DELIVERY
      */

      addShipment,
      deleteShipment,
      resetDelivery,

      getItemShippedQty,
      getAvailableShipmentQty,

      /*
        RESET
      */

      resetOrder,
      resetToDemoData,
      clearAllOrders,

      /*
        LOCK
      */

      isOrderLocked,
      calculateAutomaticStatus,

      /*
        REPORT HELPERS
      */

      getTotalOrderQty,
      getTotalProductionQty,
      getTotalProductionRemaining,

      getTotalQCQty,
      getTotalQCPassedQty,
      getTotalQCPending,

      getTotalShippedQty,
    }),
    [
      orders,
      stats,

      addOrder,
      updateOrder,
      deleteOrder,
      getOrderById,

      updateProduction,
      updateItemProduction,
      resetItemProduction,

      updateQC,
      updateItemQC,
      resetItemQC,

      addShipment,
      deleteShipment,
      resetDelivery,

      getItemShippedQty,
      getAvailableShipmentQty,

      resetOrder,
      resetToDemoData,
      clearAllOrders,
    ]
  );

  return (
    <POContext.Provider
      value={value}
    >
      {children}
    </POContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function usePO() {
  const context =
    useContext(POContext);

  if (!context) {
    throw new Error(
      "usePO harus digunakan di dalam POProvider"
    );
  }

  return context;
}

export default POContext;