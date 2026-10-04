import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileDown,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { usePO } from "../context/POContext";

function Reports() {
  const {
    orders,
    getTotalOrderQty,
    getTotalProductionQty,
    getTotalProductionRemaining,
    getTotalQCPassedQty,
    getTotalQCPending,
    getTotalShippedQty,
  } = usePO();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("Semua");

  const [isGeneratingPDF, setIsGeneratingPDF] =
    useState(false);

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

  const formatDateLong = (date) => {
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
  // HELPERS
  // =====================================================

  const getPOName = (order) => {
    return (
      order?.poNumber ||
      order?.poNo ||
      order?.number ||
      `PO-${order?.id || "-"}`
    );
  };

  const getCustomerName = (order) => {
    return (
      order?.customer ||
      order?.company ||
      order?.client ||
      "-"
    );
  };

  const getItems = (order) => {
    return Array.isArray(order?.items)
      ? order.items
      : [];
  };

  const getTotalValue = (order) => {
    if (
      order?.totalValue !== undefined &&
      order?.totalValue !== null
    ) {
      return Number(order.totalValue || 0);
    }

    return getItems(order).reduce(
      (total, item) => {
        const qty = Number(item?.qty || 0);

        const price = Number(
          item?.price ??
            item?.unitPrice ??
            0
        );

        return total + qty * price;
      },
      0
    );
  };

  const getStatus = (order) => {
    return order?.status || "Order Masuk";
  };

  const getStatusClass = (status) => {
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
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const matchesSearch = (order) => {
    const keyword = search
      .trim()
      .toLowerCase();

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
          item?.name ||
          item?.itemName ||
          "";

        const code =
          item?.code || "";

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
  // FILTER REPORT
  // =====================================================

  const reportOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter((order) => {
      if (!matchesSearch(order)) {
        return false;
      }

      const status = getStatus(order);

      if (
        statusFilter !== "Semua" &&
        status !== statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    const list = Array.isArray(orders)
      ? orders
      : [];

    const totalPO = list.length;

    const completedPO = list.filter(
      (order) =>
        getStatus(order) ===
        "Selesai"
    ).length;

    const partialPO = list.filter(
      (order) =>
        getStatus(order) ===
        "Terkirim Sebagian"
    ).length;

    const inProcessPO = list.filter(
      (order) => {
        const status =
          getStatus(order);

        return [
          "Cek Material",
          "Produksi",
          "QC",
          "Packing",
        ].includes(status);
      }
    ).length;

    const readyToShipPO = list.filter(
      (order) =>
        getStatus(order) ===
        "Siap Kirim"
    ).length;

    const totalValue = list.reduce(
      (total, order) =>
        total +
        getTotalValue(order),
      0
    );

    const completedValue =
      list
        .filter(
          (order) =>
            getStatus(order) ===
            "Selesai"
        )
        .reduce(
          (total, order) =>
            total +
            getTotalValue(order),
          0
        );

    const totalOrderQty =
      list.reduce(
        (total, order) =>
          total +
          getTotalOrderQty(order),
        0
      );

    const totalProductionQty =
      list.reduce(
        (total, order) =>
          total +
          getTotalProductionQty(
            order
          ),
        0
      );

    const totalProductionRemaining =
      list.reduce(
        (total, order) =>
          total +
          getTotalProductionRemaining(
            order
          ),
        0
      );

    const totalQCPassed =
      list.reduce(
        (total, order) =>
          total +
          getTotalQCPassedQty(
            order
          ),
        0
      );

    const totalQCPending =
      list.reduce(
        (total, order) =>
          total +
          getTotalQCPending(
            order
          ),
        0
      );

    const totalShipped =
      list.reduce(
        (total, order) =>
          total +
          getTotalShippedQty(
            order
          ),
        0
      );

    const totalRemainingDelivery =
      Math.max(
        totalOrderQty -
          totalShipped,
        0
      );

    return {
      totalPO,
      completedPO,
      partialPO,
      inProcessPO,
      readyToShipPO,
      totalValue,
      completedValue,
      totalOrderQty,
      totalProductionQty,
      totalProductionRemaining,
      totalQCPassed,
      totalQCPending,
      totalShipped,
      totalRemainingDelivery,
    };
  }, [
    orders,
    getTotalOrderQty,
    getTotalProductionQty,
    getTotalProductionRemaining,
    getTotalQCPassedQty,
    getTotalQCPending,
    getTotalShippedQty,
  ]);

  // =====================================================
  // PERCENTAGE
  // =====================================================

  const completionPercentage =
    summary.totalPO > 0
      ? Math.round(
          (summary.completedPO /
            summary.totalPO) *
            100
        )
      : 0;

  const productionPercentage =
    summary.totalOrderQty > 0
      ? Math.round(
          (summary.totalProductionQty /
            summary.totalOrderQty) *
            100
        )
      : 0;

  const qcPercentage =
    summary.totalOrderQty > 0
      ? Math.round(
          (summary.totalQCPassed /
            summary.totalOrderQty) *
            100
        )
      : 0;

  const deliveryPercentage =
    summary.totalOrderQty > 0
      ? Math.round(
          (summary.totalShipped /
            summary.totalOrderQty) *
            100
        )
      : 0;

  // =====================================================
  // STATUS BREAKDOWN
  // =====================================================

  const statusBreakdown = useMemo(() => {
    const statuses = [
      "Order Masuk",
      "Cek Material",
      "Produksi",
      "QC",
      "Packing",
      "Siap Kirim",
      "Terkirim Sebagian",
      "Terkirim",
      "Selesai",
      "Terlambat",
      "Dibatalkan",
    ];

    return statuses
      .map((status) => ({
        status,
        count: orders.filter(
          (order) =>
            getStatus(order) ===
            status
        ).length,
      }))
      .filter(
        (item) => item.count > 0
      );
  }, [orders]);

  // =====================================================
  // PDF
  // =====================================================

  const generatePDF = () => {
    try {
      setIsGeneratingPDF(true);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      // -------------------------------------------------
      // HEADER
      // -------------------------------------------------

      pdf.setFillColor(
        15,
        23,
        42
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        32,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(20);

      pdf.text(
        "COMPANY REPORT",
        14,
        13
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(9);

      pdf.text(
        "PURCHASE ORDER MANAGEMENT SYSTEM",
        14,
        19
      );

      pdf.setFontSize(8);

      pdf.text(
        `Generated: ${formatDateLong(
          new Date()
        )}`,
        pageWidth - 14,
        13,
        {
          align: "right",
        }
      );

      pdf.text(
        "Internal Management Report",
        pageWidth - 14,
        19,
        {
          align: "right",
        }
      );

      // -------------------------------------------------
      // REPORT TITLE
      // -------------------------------------------------

      pdf.setTextColor(
        15,
        23,
        42
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(15);

      pdf.text(
        "Laporan Purchase Order",
        14,
        44
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(9);

      pdf.setTextColor(
        100,
        116,
        139
      );

      pdf.text(
        `Total ${summary.totalPO} PO | ${summary.completedPO} PO selesai | ${formatCurrency(
          summary.completedValue
        )} nilai PO selesai`,
        14,
        50
      );

      // -------------------------------------------------
      // SUMMARY BOXES
      // -------------------------------------------------

      const boxY = 57;
      const boxHeight = 25;
      const boxGap = 5;
      const boxWidth =
        (pageWidth -
          28 -
          boxGap * 3) /
        4;

      const summaryBoxes = [
        {
          title: "TOTAL PO",
          value: formatNumber(
            summary.totalPO
          ),
          subtitle: "Purchase Order",
        },
        {
          title: "PO SELESAI",
          value: formatNumber(
            summary.completedPO
          ),
          subtitle: `${completionPercentage}% dari total`,
        },
        {
          title: "TOTAL TERKIRIM",
          value: `${formatNumber(
            summary.totalShipped
          )} pcs`,
          subtitle: `${deliveryPercentage}% dari qty`,
        },
        {
          title: "NILAI SELESAI",
          value: formatCurrency(
            summary.completedValue
          ),
          subtitle: `dari ${formatCurrency(
            summary.totalValue
          )}`,
        },
      ];

      summaryBoxes.forEach(
        (box, index) => {
          const x =
            14 +
            index *
              (boxWidth + boxGap);

          pdf.setFillColor(
            248,
            250,
            252
          );

          pdf.setDrawColor(
            226,
            232,
            240
          );

          pdf.roundedRect(
            x,
            boxY,
            boxWidth,
            boxHeight,
            2,
            2,
            "FD"
          );

          pdf.setTextColor(
            100,
            116,
            139
          );

          pdf.setFontSize(7);

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.text(
            box.title,
            x + 5,
            boxY + 7
          );

          pdf.setTextColor(
            15,
            23,
            42
          );

          pdf.setFontSize(12);

          pdf.text(
            box.value,
            x + 5,
            boxY + 15
          );

          pdf.setTextColor(
            148,
            163,
            184
          );

          pdf.setFontSize(6.5);

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.text(
            box.subtitle,
            x + 5,
            boxY + 21
          );
        }
      );

      // -------------------------------------------------
      // PROGRESS
      // -------------------------------------------------

      const progressY = 88;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.setTextColor(
        15,
        23,
        42
      );

      pdf.text(
        "Progress Operasional",
        14,
        progressY
      );

      const progressItems = [
        {
          label: "Produksi",
          value: productionPercentage,
          detail: `${formatNumber(
            summary.totalProductionQty
          )} pcs selesai`,
        },
        {
          label: "QC Passed",
          value: qcPercentage,
          detail: `${formatNumber(
            summary.totalQCPassed
          )} pcs passed`,
        },
        {
          label: "Pengiriman",
          value: deliveryPercentage,
          detail: `${formatNumber(
            summary.totalShipped
          )} pcs terkirim`,
        },
      ];

      const progressWidth =
        pageWidth - 28;

      progressItems.forEach(
        (item, index) => {
          const y =
            progressY +
            8 +
            index * 12;

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.setTextColor(
            71,
            85,
            105
          );

          pdf.text(
            item.label,
            14,
            y
          );

          pdf.text(
            `${item.value}%`,
            pageWidth - 14,
            y,
            {
              align: "right",
            }
          );

          pdf.setFillColor(
            226,
            232,
            240
          );

          pdf.roundedRect(
            55,
            y - 4,
            progressWidth - 75,
            3,
            1,
            1,
            "F"
          );

          pdf.setFillColor(
            51,
            65,
            85
          );

          pdf.roundedRect(
            55,
            y - 4,
            ((progressWidth - 75) *
              Math.min(
                item.value,
                100
              )) /
              100,
            3,
            1,
            1,
            "F"
          );

          pdf.setTextColor(
            100,
            116,
            139
          );

          pdf.text(
            item.detail,
            55,
            y + 4
          );
        }
      );

      // -------------------------------------------------
      // STATUS SUMMARY
      // -------------------------------------------------

      const statusY = 130;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.setTextColor(
        15,
        23,
        42
      );

      pdf.text(
        "Distribusi Status",
        14,
        statusY
      );

      let statusX = 14;

      statusBreakdown.forEach(
        (item) => {
          const label = `${item.status}: ${item.count}`;

          pdf.setFontSize(7);

          const width =
            pdf.getTextWidth(
              label
            ) + 8;

          if (
            statusX + width >
            pageWidth - 14
          ) {
            statusX = 14;
          }

          pdf.setFillColor(
            241,
            245,
            249
          );

          pdf.roundedRect(
            statusX,
            statusY + 4,
            width,
            7,
            1.5,
            1.5,
            "F"
          );

          pdf.setTextColor(
            71,
            85,
            105
          );

          pdf.text(
            label,
            statusX + 4,
            statusY + 8.7
          );

          statusX +=
            width + 3;
        }
      );

      // -------------------------------------------------
      // TABLE
      // -------------------------------------------------

      const tableRows =
        reportOrders.map(
          (order) => [
            getPOName(order),
            getCustomerName(order),
            formatDate(
              order?.orderDate
            ),
            formatDate(
              order?.deadline
            ),
            formatNumber(
              getTotalOrderQty(
                order
              )
            ),
            formatNumber(
              getTotalProductionQty(
                order
              )
            ),
            formatNumber(
              getTotalQCPassedQty(
                order
              )
            ),
            formatNumber(
              getTotalShippedQty(
                order
              )
            ),
            getStatus(order),
            formatCurrency(
              getTotalValue(order)
            ),
          ]
        );

      autoTable(pdf, {
        startY: 151,

        head: [
          [
            "PO",
            "Customer",
            "Tanggal",
            "Deadline",
            "Qty PO",
            "Produksi",
            "QC Passed",
            "Terkirim",
            "Status",
            "Nilai PO",
          ],
        ],

        body: tableRows,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 7,
          cellPadding: 2.5,
          textColor: [
            51,
            65,
            85,
          ],
          lineColor: [
            226,
            232,
            240,
          ],
          lineWidth: 0.2,
        },

        headStyles: {
          fillColor: [
            15,
            23,
            42,
          ],
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
          fontSize: 7,
          halign: "center",
        },

        alternateRowStyles: {
          fillColor: [
            248,
            250,
            252,
          ],
        },

        columnStyles: {
          0: {
            cellWidth: 25,
          },

          1: {
            cellWidth: 40,
          },

          2: {
            cellWidth: 25,
          },

          3: {
            cellWidth: 25,
          },

          4: {
            cellWidth: 20,
            halign: "center",
          },

          5: {
            cellWidth: 22,
            halign: "center",
          },

          6: {
            cellWidth: 22,
            halign: "center",
          },

          7: {
            cellWidth: 22,
            halign: "center",
          },

          8: {
            cellWidth: 30,
            halign: "center",
          },

          9: {
            cellWidth: 35,
            halign: "right",
          },
        },

        didParseCell: (
          data
        ) => {
          if (
            data.section ===
              "body" &&
            data.column.index ===
              8
          ) {
            const status =
              data.cell.text?.[0];

            if (
              status === "Selesai"
            ) {
              data.cell.styles.textColor =
                [
                  5,
                  150,
                  105,
                ];

              data.cell.styles.fontStyle =
                "bold";
            }

            if (
              status ===
              "Terkirim Sebagian"
            ) {
              data.cell.styles.textColor =
                [
                  234,
                  88,
                  12,
                ];

              data.cell.styles.fontStyle =
                "bold";
            }

            if (
              status ===
              "Produksi"
            ) {
              data.cell.styles.textColor =
                [
                  217,
                  119,
                  6,
                ];

              data.cell.styles.fontStyle =
                "bold";
            }
          }
        },

        didDrawPage: () => {
          // HEADER MINI PADA HALAMAN LANJUTAN
          if (
            pdf.getCurrentPageInfo()
              .pageNumber > 1
          ) {
            pdf.setFillColor(
              15,
              23,
              42
            );

            pdf.rect(
              0,
              0,
              pageWidth,
              10,
              "F"
            );

            pdf.setTextColor(
              255,
              255,
              255
            );

            pdf.setFont(
              "helvetica",
              "bold"
            );

            pdf.setFontSize(7);

            pdf.text(
              "COMPANY REPORT — PURCHASE ORDER REPORT",
              14,
              6.5
            );
          }

          // FOOTER
          pdf.setTextColor(
            148,
            163,
            184
          );

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(6.5);

          pdf.text(
            "Generated automatically from Company Report System",
            14,
            pageHeight - 7
          );

          pdf.text(
            `Page ${
              pdf.getCurrentPageInfo()
                .pageNumber
            }`,
            pageWidth - 14,
            pageHeight - 7,
            {
              align: "right",
            }
          );
        },
      });

      // -------------------------------------------------
      // FOOTER SUMMARY
      // -------------------------------------------------

      const finalY =
        pdf.lastAutoTable?.finalY ||
        160;

      if (
        finalY <
        pageHeight - 35
      ) {
        pdf.setDrawColor(
          226,
          232,
          240
        );

        pdf.line(
          14,
          finalY + 8,
          pageWidth - 14,
          finalY + 8
        );

        pdf.setTextColor(
          71,
          85,
          105
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(8);

        pdf.text(
          "RINGKASAN",
          14,
          finalY + 16
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.text(
          `PO selesai: ${formatNumber(
            summary.completedPO
          )} | PO dalam proses: ${formatNumber(
            summary.inProcessPO
          )} | Siap kirim: ${formatNumber(
            summary.readyToShipPO
          )} | Terkirim sebagian: ${formatNumber(
            summary.partialPO
          )}`,
          14,
          finalY + 22
        );

        pdf.text(
          `Total nilai PO: ${formatCurrency(
            summary.totalValue
          )} | Nilai PO selesai: ${formatCurrency(
            summary.completedValue
          )}`,
          14,
          finalY + 27
        );
      }

      // -------------------------------------------------
      // SAVE
      // -------------------------------------------------

      const dateString =
        new Date()
          .toISOString()
          .slice(0, 10);

      pdf.save(
        `Company-Report-${dateString}.pdf`
      );
    } catch (error) {
      console.error(
        "Gagal membuat PDF:",
        error
      );

      alert(
        "Gagal membuat PDF. Silakan cek console."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // =====================================================
  // CSV
  // =====================================================

  const exportCSV = () => {
    const headers = [
      "PO",
      "Customer",
      "Tanggal PO",
      "Deadline",
      "Status",
      "Qty PO",
      "Produksi",
      "Sisa Produksi",
      "QC Passed",
      "QC Pending",
      "Terkirim",
      "Sisa Pengiriman",
      "Nilai PO",
    ];

    const rows = reportOrders.map(
      (order) => [
        getPOName(order),
        getCustomerName(order),
        order?.orderDate || "",
        order?.deadline || "",
        getStatus(order),
        getTotalOrderQty(order),
        getTotalProductionQty(
          order
        ),
        getTotalProductionRemaining(
          order
        ),
        getTotalQCPassedQty(order),
        getTotalQCPending(order),
        getTotalShippedQty(order),
        Math.max(
          getTotalOrderQty(order) -
            getTotalShippedQty(order),
          0
        ),
        getTotalValue(order),
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value ?? "");

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `Company-Report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <BarChart3 size={18} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
              Reports
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              Laporan otomatis berdasarkan progress PO.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:h-10 sm:px-4 sm:text-sm"
          >
            <Download size={15} />
            <span className="hidden sm:inline">
              CSV
            </span>
            <span className="sm:hidden">
              CSV
            </span>
          </button>

          <button
            type="button"
            onClick={generatePDF}
            disabled={
              isGeneratingPDF
            }
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-4 sm:text-sm"
          >
            <FileDown size={15} />

            {isGeneratingPDF
              ? "Membuat..."
              : "Download PDF"}
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 sm:text-sm">
              Total PO
            </p>

            <ClipboardList
              size={16}
              className="text-slate-400"
            />
          </div>

          <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {formatNumber(
              summary.totalPO
            )}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            seluruh order
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 sm:text-sm">
              PO Selesai
            </p>

            <CheckCircle2
              size={16}
              className="text-emerald-500"
            />
          </div>

          <p className="mt-2 text-xl font-bold text-emerald-600 sm:text-2xl">
            {formatNumber(
              summary.completedPO
            )}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            {completionPercentage}% dari total
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 sm:text-sm">
              Terkirim
            </p>

            <Truck
              size={16}
              className="text-blue-500"
            />
          </div>

          <p className="mt-2 text-xl font-bold text-blue-600 sm:text-2xl">
            {formatNumber(
              summary.totalShipped
            )}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            {deliveryPercentage}% qty PO
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 sm:text-sm">
              Nilai Selesai
            </p>

            <PackageCheck
              size={16}
              className="text-emerald-500"
            />
          </div>

          <p className="mt-2 truncate text-base font-bold text-slate-900 sm:text-xl">
            {formatCurrency(
              summary.completedValue
            )}
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            nilai PO selesai
          </p>
        </div>
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ProgressCard
          icon={
            <Clock3
              size={16}
              className="text-amber-500"
            />
          }
          title="Produksi"
          percentage={
            productionPercentage
          }
          left={`${formatNumber(
            summary.totalProductionQty
          )} selesai`}
          right={`${formatNumber(
            summary.totalProductionRemaining
          )} sisa`}
        />

        <ProgressCard
          icon={
            <PackageCheck
              size={16}
              className="text-purple-500"
            />
          }
          title="Quality Control"
          percentage={
            qcPercentage
          }
          left={`${formatNumber(
            summary.totalQCPassed
          )} passed`}
          right={`${formatNumber(
            summary.totalQCPending
          )} pending`}
        />

        <ProgressCard
          icon={
            <Truck
              size={16}
              className="text-blue-500"
            />
          }
          title="Pengiriman"
          percentage={
            deliveryPercentage
          }
          left={`${formatNumber(
            summary.totalShipped
          )} terkirim`}
          right={`${formatNumber(
            summary.totalRemainingDelivery
          )} sisa`}
        />
      </div>

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_auto]">
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

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-slate-500 sm:min-w-[180px] sm:text-sm"
          >
            <option value="Semua">
              Semua Status
            </option>

            <option value="Order Masuk">
              Order Masuk
            </option>

            <option value="Cek Material">
              Cek Material
            </option>

            <option value="Produksi">
              Produksi
            </option>

            <option value="QC">
              QC
            </option>

            <option value="Packing">
              Packing
            </option>

            <option value="Siap Kirim">
              Siap Kirim
            </option>

            <option value="Terkirim Sebagian">
              Terkirim Sebagian
            </option>

            <option value="Terkirim">
              Terkirim
            </option>

            <option value="Selesai">
              Selesai
            </option>

            <option value="Terlambat">
              Terlambat
            </option>

            <option value="Dibatalkan">
              Dibatalkan
            </option>
          </select>
        </div>
      </div>

      {/* =================================================
          STATUS
      ================================================= */}

      {statusBreakdown.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Distribusi Status
            </h2>

            <p className="text-[10px] text-slate-400 sm:text-xs">
              Kondisi seluruh PO saat ini.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusBreakdown.map(
              (item) => (
                <button
                  key={item.status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      item.status
                    )
                  }
                  className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition hover:opacity-80 sm:text-xs ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}:{" "}
                  {item.count}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
        <div className="border-b border-slate-200 p-3 sm:p-5">
          <h2 className="text-sm font-bold text-slate-900 sm:text-base">
            Detail Report PO
          </h2>

          <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
            {reportOrders.length} PO ditampilkan
          </p>
        </div>

        {/* MOBILE */}

        <div className="space-y-2.5 p-3 sm:hidden">
          {reportOrders.length ===
          0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Tidak ada data report.
            </div>
          ) : (
            reportOrders.map(
              (order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">
                        {getPOName(
                          order
                        )}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {getCustomerName(
                          order
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                        getStatus(
                          order
                        )
                      )}`}
                    >
                      {getStatus(order)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ReportMini
                      label="Qty PO"
                      value={formatNumber(
                        getTotalOrderQty(
                          order
                        )
                      )}
                    />

                    <ReportMini
                      label="Produksi"
                      value={formatNumber(
                        getTotalProductionQty(
                          order
                        )
                      )}
                    />

                    <ReportMini
                      label="QC Passed"
                      value={formatNumber(
                        getTotalQCPassedQty(
                          order
                        )
                      )}
                    />

                    <ReportMini
                      label="Terkirim"
                      value={formatNumber(
                        getTotalShippedQty(
                          order
                        )
                      )}
                    />
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-[10px] text-slate-400">
                        Nilai PO
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(
                          getTotalValue(
                            order
                          )
                        )}
                      </span>
                    </div>

                    <div className="mt-1 flex justify-between gap-3">
                      <span className="text-[10px] text-slate-400">
                        Deadline
                      </span>

                      <span className="text-[10px] text-slate-600">
                        {formatDate(
                          order?.deadline
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* DESKTOP */}

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">
                  PO
                </th>

                <th className="px-5 py-3">
                  Customer
                </th>

                <th className="px-5 py-3">
                  Tanggal
                </th>

                <th className="px-5 py-3 text-center">
                  Qty PO
                </th>

                <th className="px-5 py-3 text-center">
                  Produksi
                </th>

                <th className="px-5 py-3 text-center">
                  QC
                </th>

                <th className="px-5 py-3 text-center">
                  Terkirim
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3 text-right">
                  Nilai
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {reportOrders.map(
                (order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {getPOName(
                          order
                        )}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Deadline{" "}
                        {formatDate(
                          order?.deadline
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-sm text-slate-700">
                      {getCustomerName(
                        order
                      )}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-500">
                      {formatDate(
                        order?.orderDate
                      )}
                    </td>

                    <td className="px-5 py-3 text-center text-sm font-semibold">
                      {formatNumber(
                        getTotalOrderQty(
                          order
                        )
                      )}
                    </td>

                    <td className="px-5 py-3 text-center text-sm font-semibold text-amber-600">
                      {formatNumber(
                        getTotalProductionQty(
                          order
                        )
                      )}
                    </td>

                    <td className="px-5 py-3 text-center text-sm font-semibold text-purple-600">
                      {formatNumber(
                        getTotalQCPassedQty(
                          order
                        )
                      )}
                    </td>

                    <td className="px-5 py-3 text-center text-sm font-semibold text-blue-600">
                      {formatNumber(
                        getTotalShippedQty(
                          order
                        )
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          getStatus(
                            order
                          )
                        )}`}
                      >
                        {getStatus(
                          order
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        getTotalValue(
                          order
                        )
                      )}
                    </td>
                  </tr>
                )
              )}

              {reportOrders.length ===
                0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Tidak ada data report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          AUTOMATIC INFO
      ================================================= */}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2
              size={17}
              className="text-emerald-600"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-emerald-800 sm:text-sm">
              Report terhubung otomatis
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-emerald-700 sm:text-xs">
              Tidak perlu input laporan secara
              manual. Ketika seluruh qty PO sudah
              terkirim, status otomatis menjadi{" "}
              <strong>Selesai</strong> dan PO
              langsung dihitung sebagai PO selesai
              di halaman Reports.
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-medium text-emerald-700 sm:text-xs">
              <span>
                {formatNumber(
                  summary.completedPO
                )}{" "}
                PO selesai
              </span>

              <span>
                {formatNumber(
                  summary.totalShipped
                )}{" "}
                pcs terkirim
              </span>

              <span>
                {formatCurrency(
                  summary.completedValue
                )}{" "}
                nilai selesai
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =======================================================
// COMPONENTS
// =======================================================

function ProgressCard({
  icon,
  title,
  percentage,
  left,
  right,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}

          <span className="text-xs font-semibold text-slate-700">
            {title}
          </span>
        </div>

        <span className="text-xs font-bold text-slate-900">
          {percentage}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-700 transition-all"
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

function ReportMini({
  label,
  value,
}) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <p className="text-[9px] text-slate-400">
        {label}
      </p>

      <p className="text-xs font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default Reports;