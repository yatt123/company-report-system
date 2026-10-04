export const orders = [
  // =====================================================
  // PO 001
  // =====================================================
  {
    id: 1001,
    poNumber: "PO-TFI-001",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-01",
    deadline: "2026-08-28",
    status: "Order Masuk",
    totalValue: 10750000,

    items: [
      {
        id: "1001-1",
        name: "Bracket Trafo 100KVA",
        code: "BRK-100",
        qty: 50,
        price: 125000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1001-2",
        name: "Clamp Besi 50mm",
        code: "CLP-050",
        qty: 100,
        price: 45000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 002
  // =====================================================
  {
    id: 1002,
    poNumber: "PO-TFI-002",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-02",
    deadline: "2026-08-29",
    status: "Produksi",
    totalValue: 15650000,

    items: [
      {
        id: "1002-1",
        name: "Cover Panel LV",
        code: "CVR-LV-01",
        qty: 30,
        price: 275000,
        production: {
          completedQty: 18,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1002-2",
        name: "Base Plate Panel",
        code: "BPL-200",
        qty: 20,
        price: 180000,
        production: {
          completedQty: 8,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1002-3",
        name: "Dudukan Busbar",
        code: "DSB-100",
        qty: 40,
        price: 95000,
        production: {
          completedQty: 15,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 003
  // =====================================================
  {
    id: 1003,
    poNumber: "PO-TFI-003",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-03",
    deadline: "2026-08-25",
    status: "QC",
    totalValue: 12250000,

    items: [
      {
        id: "1003-1",
        name: "Support Trafo",
        code: "SUP-TRF-01",
        qty: 25,
        price: 320000,
        production: {
          completedQty: 25,
        },
        qc: {
          passedQty: 18,
        },
      },
      {
        id: "1003-2",
        name: "Plat Dudukan Kabel",
        code: "PDK-075",
        qty: 50,
        price: 85000,
        production: {
          completedQty: 50,
        },
        qc: {
          passedQty: 35,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 004
  // =====================================================
  {
    id: 1004,
    poNumber: "PO-TFI-004",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-04",
    deadline: "2026-08-26",
    status: "Siap Kirim",
    totalValue: 9750000,

    items: [
      {
        id: "1004-1",
        name: "Box Terminal Trafo",
        code: "BT-250",
        qty: 15,
        price: 450000,
        production: {
          completedQty: 15,
        },
        qc: {
          passedQty: 15,
        },
      },
      {
        id: "1004-2",
        name: "Bracket Kabel 100mm",
        code: "BRK-100C",
        qty: 40,
        price: 75000,
        production: {
          completedQty: 40,
        },
        qc: {
          passedQty: 40,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 005
  // =====================================================
  {
    id: 1005,
    poNumber: "PO-TFI-005",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-05",
    deadline: "2026-08-27",
    status: "Terkirim Sebagian",
    totalValue: 16900000,

    items: [
      {
        id: "1005-1",
        name: "Panel Door 600x800",
        code: "PDR-6080",
        qty: 20,
        price: 650000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1005-2",
        name: "Hinge Panel Heavy Duty",
        code: "HPH-001",
        qty: 40,
        price: 55000,
        production: {
          completedQty: 40,
        },
        qc: {
          passedQty: 40,
        },
      },
      {
        id: "1005-3",
        name: "Lock Panel",
        code: "LCK-001",
        qty: 20,
        price: 85000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
    ],

    delivery: {
      shipments: [
        {
          id: 5001,
          driverName: "Budi Santoso",
          deliveryDate: "2026-08-18",
          status: "Terkirim",
          items: [
            {
              itemId: "1005-1",
              name: "Panel Door 600x800",
              code: "PDR-6080",
              qty: 10,
            },
            {
              itemId: "1005-2",
              name: "Hinge Panel Heavy Duty",
              code: "HPH-001",
              qty: 20,
            },
            {
              itemId: "1005-3",
              name: "Lock Panel",
              code: "LCK-001",
              qty: 10,
            },
          ],
        },
      ],
    },
  },

  // =====================================================
  // PO 006
  // =====================================================
  {
    id: 1006,
    poNumber: "PO-TFI-006",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-06",
    deadline: "2026-08-24",
    status: "Selesai",
    totalValue: 16000000,

    items: [
      {
        id: "1006-1",
        name: "Base Frame Trafo",
        code: "BFR-500",
        qty: 10,
        price: 1250000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 10,
        },
      },
      {
        id: "1006-2",
        name: "Plat Penguat Frame",
        code: "PPF-300",
        qty: 20,
        price: 175000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
    ],

    delivery: {
      shipments: [
        {
          id: 5002,
          driverName: "Andi Saputra",
          deliveryDate: "2026-08-20",
          status: "Terkirim",
          items: [
            {
              itemId: "1006-1",
              name: "Base Frame Trafo",
              code: "BFR-500",
              qty: 10,
            },
            {
              itemId: "1006-2",
              name: "Plat Penguat Frame",
              code: "PPF-300",
              qty: 20,
            },
          ],
        },
      ],
    },
  },

  // =====================================================
  // PO 007
  // =====================================================
  {
    id: 1007,
    poNumber: "PO-TFI-007",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-07",
    deadline: "2026-08-30",
    status: "Produksi",
    totalValue: 18575000,

    items: [
      {
        id: "1007-1",
        name: "Bracket Support Coil",
        code: "BSC-001",
        qty: 60,
        price: 110000,
        production: {
          completedQty: 25,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1007-2",
        name: "Clamp Trafo 150KVA",
        code: "CTR-150",
        qty: 30,
        price: 145000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1007-3",
        name: "Plat Mounting",
        code: "PLT-MNT",
        qty: 50,
        price: 90000,
        production: {
          completedQty: 35,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1007-4",
        name: "Dudukan Sensor",
        code: "DSN-001",
        qty: 25,
        price: 125000,
        production: {
          completedQty: 5,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 008
  // =====================================================
  {
    id: 1008,
    poNumber: "PO-TFI-008",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-08",
    deadline: "2026-08-31",
    status: "QC",
    totalValue: 20280000,

    items: [
      {
        id: "1008-1",
        name: "Cover Trafo 250KVA",
        code: "CVR-250",
        qty: 12,
        price: 850000,
        production: {
          completedQty: 12,
        },
        qc: {
          passedQty: 7,
        },
      },
      {
        id: "1008-2",
        name: "Side Plate Trafo",
        code: "SPT-250",
        qty: 24,
        price: 325000,
        production: {
          completedQty: 24,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1008-3",
        name: "Bracket Cover",
        code: "BRC-CVR",
        qty: 24,
        price: 95000,
        production: {
          completedQty: 24,
        },
        qc: {
          passedQty: 24,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 009
  // =====================================================
  {
    id: 1009,
    poNumber: "PO-TFI-009",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-09",
    deadline: "2026-09-01",
    status: "Siap Kirim",
    totalValue: 15660000,

    items: [
      {
        id: "1009-1",
        name: "Terminal Box Outdoor",
        code: "TBO-001",
        qty: 18,
        price: 525000,
        production: {
          completedQty: 18,
        },
        qc: {
          passedQty: 18,
        },
      },
      {
        id: "1009-2",
        name: "Bracket Outdoor",
        code: "BRO-001",
        qty: 36,
        price: 80000,
        production: {
          completedQty: 36,
        },
        qc: {
          passedQty: 36,
        },
      },
      {
        id: "1009-3",
        name: "Cover Junction",
        code: "CVJ-001",
        qty: 18,
        price: 185000,
        production: {
          completedQty: 18,
        },
        qc: {
          passedQty: 18,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 010
  // =====================================================
  {
    id: 1010,
    poNumber: "PO-TFI-010",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-10",
    deadline: "2026-09-02",
    status: "Produksi",
    totalValue: 41700000,

    items: [
      {
        id: "1010-1",
        name: "Frame Panel 800x1200",
        code: "FRP-8012",
        qty: 15,
        price: 950000,
        production: {
          completedQty: 5,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1010-2",
        name: "Door Panel 800x1200",
        code: "DPR-8012",
        qty: 15,
        price: 875000,
        production: {
          completedQty: 3,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1010-3",
        name: "Base Panel",
        code: "BSP-8012",
        qty: 15,
        price: 475000,
        production: {
          completedQty: 8,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1010-4",
        name: "Cover Top Panel",
        code: "CTP-8012",
        qty: 15,
        price: 350000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1010-5",
        name: "Bracket Panel",
        code: "BKP-8012",
        qty: 30,
        price: 65000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 011
  // =====================================================
  {
    id: 1011,
    poNumber: "PO-TFI-011",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-11",
    deadline: "2026-09-03",
    status: "Order Masuk",
    totalValue: 14950000,

    items: [
      {
        id: "1011-1",
        name: "Bracket Trafo 160KVA",
        code: "BRK-160",
        qty: 45,
        price: 145000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1011-2",
        name: "Clamp Kabel 75mm",
        code: "CLP-075",
        qty: 80,
        price: 55000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1011-3",
        name: "Plat Support Busbar",
        code: "PSB-125",
        qty: 35,
        price: 115000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 012
  // =====================================================
  {
    id: 1012,
    poNumber: "PO-TFI-012",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-12",
    deadline: "2026-09-04",
    status: "Produksi",
    totalValue: 41625000,

    items: [
      {
        id: "1012-1",
        name: "Panel Box 400x600",
        code: "PBX-4060",
        qty: 25,
        price: 725000,
        production: {
          completedQty: 12,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1012-2",
        name: "Door Panel 400x600",
        code: "DP-4060",
        qty: 25,
        price: 525000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1012-3",
        name: "Base Plate 400x600",
        code: "BP-4060",
        qty: 25,
        price: 285000,
        production: {
          completedQty: 15,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1012-4",
        name: "Bracket Panel Box",
        code: "BPB-001",
        qty: 50,
        price: 65000,
        production: {
          completedQty: 30,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 013
  // =====================================================
  {
    id: 1013,
    poNumber: "PO-TFI-013",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-13",
    deadline: "2026-09-05",
    status: "QC",
    totalValue: 26130000,

    items: [
      {
        id: "1013-1",
        name: "Frame Trafo 200KVA",
        code: "FTR-200",
        qty: 12,
        price: 1450000,
        production: {
          completedQty: 12,
        },
        qc: {
          passedQty: 8,
        },
      },
      {
        id: "1013-2",
        name: "Plat Penguat Frame",
        code: "PPF-400",
        qty: 24,
        price: 195000,
        production: {
          completedQty: 24,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1013-3",
        name: "Support Insulator",
        code: "SPI-200",
        qty: 30,
        price: 135000,
        production: {
          completedQty: 30,
        },
        qc: {
          passedQty: 25,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 014
  // =====================================================
  {
    id: 1014,
    poNumber: "PO-TFI-014",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-14",
    deadline: "2026-09-06",
    status: "Siap Kirim",
    totalValue: 30500000,

    items: [
      {
        id: "1014-1",
        name: "Cover Panel 600x1000",
        code: "CVP-6100",
        qty: 20,
        price: 685000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1014-2",
        name: "Door Panel 600x1000",
        code: "DOP-6100",
        qty: 20,
        price: 625000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1014-3",
        name: "Hinge Heavy Duty",
        code: "HHD-002",
        qty: 40,
        price: 60000,
        production: {
          completedQty: 40,
        },
        qc: {
          passedQty: 40,
        },
      },
      {
        id: "1014-4",
        name: "Lock Panel Stainless",
        code: "LPS-002",
        qty: 20,
        price: 95000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 015
  // =====================================================
  {
    id: 1015,
    poNumber: "PO-TFI-015",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-15",
    deadline: "2026-09-07",
    status: "Terkirim Sebagian",
    totalValue: 16400000,

    items: [
      {
        id: "1015-1",
        name: "Terminal Box Indoor",
        code: "TBI-002",
        qty: 20,
        price: 485000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1015-2",
        name: "Bracket Terminal Box",
        code: "BTB-002",
        qty: 40,
        price: 85000,
        production: {
          completedQty: 40,
        },
        qc: {
          passedQty: 40,
        },
      },
      {
        id: "1015-3",
        name: "Cover Terminal Box",
        code: "CTB-002",
        qty: 20,
        price: 165000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
    ],

    delivery: {
      shipments: [
        {
          id: 5003,
          driverName: "Rizky Maulana",
          deliveryDate: "2026-08-21",
          status: "Terkirim",
          items: [
            {
              itemId: "1015-1",
              name: "Terminal Box Indoor",
              code: "TBI-002",
              qty: 10,
            },
            {
              itemId: "1015-2",
              name: "Bracket Terminal Box",
              code: "BTB-002",
              qty: 20,
            },
            {
              itemId: "1015-3",
              name: "Cover Terminal Box",
              code: "CTB-002",
              qty: 10,
            },
          ],
        },
      ],
    },
  },

  // =====================================================
  // PO 016
  // =====================================================
  {
    id: 1016,
    poNumber: "PO-TFI-016",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-16",
    deadline: "2026-09-08",
    status: "Selesai",
    totalValue: 22500000,

    items: [
      {
        id: "1016-1",
        name: "Base Frame Panel",
        code: "BFP-600",
        qty: 10,
        price: 1150000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 10,
        },
      },
      {
        id: "1016-2",
        name: "Side Plate Panel",
        code: "SPP-600",
        qty: 20,
        price: 245000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
      {
        id: "1016-3",
        name: "Support Bracket Panel",
        code: "SBP-600",
        qty: 30,
        price: 95000,
        production: {
          completedQty: 30,
        },
        qc: {
          passedQty: 30,
        },
      },
      {
        id: "1016-4",
        name: "Cover Bottom Panel",
        code: "CBP-600",
        qty: 10,
        price: 325000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 10,
        },
      },
    ],

    delivery: {
      shipments: [
        {
          id: 5004,
          driverName: "Dedi Kurniawan",
          deliveryDate: "2026-08-22",
          status: "Terkirim",
          items: [
            {
              itemId: "1016-1",
              name: "Base Frame Panel",
              code: "BFP-600",
              qty: 10,
            },
            {
              itemId: "1016-2",
              name: "Side Plate Panel",
              code: "SPP-600",
              qty: 20,
            },
            {
              itemId: "1016-3",
              name: "Support Bracket Panel",
              code: "SBP-600",
              qty: 30,
            },
            {
              itemId: "1016-4",
              name: "Cover Bottom Panel",
              code: "CBP-600",
              qty: 10,
            },
          ],
        },
      ],
    },
  },

  // =====================================================
  // PO 017
  // =====================================================
  {
    id: 1017,
    poNumber: "PO-TFI-017",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-17",
    deadline: "2026-09-10",
    status: "Produksi",
    totalValue: 28025000,

    items: [
      {
        id: "1017-1",
        name: "Bracket Coil 250KVA",
        code: "BCK-250",
        qty: 50,
        price: 175000,
        production: {
          completedQty: 28,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1017-2",
        name: "Clamp Trafo 250KVA",
        code: "CTR-250",
        qty: 35,
        price: 165000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1017-3",
        name: "Plat Mounting Trafo",
        code: "PMT-250",
        qty: 45,
        price: 125000,
        production: {
          completedQty: 32,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1017-4",
        name: "Dudukan Kabel Trafo",
        code: "DKT-250",
        qty: 60,
        price: 75000,
        production: {
          completedQty: 40,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1017-5",
        name: "Support Sensor",
        code: "SSR-250",
        qty: 25,
        price: 135000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 018
  // =====================================================
  {
    id: 1018,
    poNumber: "PO-TFI-018",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-18",
    deadline: "2026-09-11",
    status: "QC",
    totalValue: 23500000,

    items: [
      {
        id: "1018-1",
        name: "Cover Trafo 400KVA",
        code: "CVR-400",
        qty: 10,
        price: 1250000,
        production: {
          completedQty: 10,
        },
        qc: {
          passedQty: 6,
        },
      },
      {
        id: "1018-2",
        name: "Side Plate Trafo 400KVA",
        code: "SPT-400",
        qty: 20,
        price: 425000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 15,
        },
      },
      {
        id: "1018-3",
        name: "Bracket Cover Trafo",
        code: "BCT-400",
        qty: 20,
        price: 125000,
        production: {
          completedQty: 20,
        },
        qc: {
          passedQty: 20,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 019
  // =====================================================
  {
    id: 1019,
    poNumber: "PO-TFI-019",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-19",
    deadline: "2026-09-12",
    status: "Siap Kirim",
    totalValue: 32325000,

    items: [
      {
        id: "1019-1",
        name: "Box Control Panel",
        code: "BCP-001",
        qty: 15,
        price: 875000,
        production: {
          completedQty: 15,
        },
        qc: {
          passedQty: 15,
        },
      },
      {
        id: "1019-2",
        name: "Door Control Panel",
        code: "DCP-001",
        qty: 15,
        price: 725000,
        production: {
          completedQty: 15,
        },
        qc: {
          passedQty: 15,
        },
      },
      {
        id: "1019-3",
        name: "Base Control Panel",
        code: "BCP-B01",
        qty: 15,
        price: 425000,
        production: {
          completedQty: 15,
        },
        qc: {
          passedQty: 15,
        },
      },
      {
        id: "1019-4",
        name: "Hinge Control Panel",
        code: "HCP-001",
        qty: 30,
        price: 65000,
        production: {
          completedQty: 30,
        },
        qc: {
          passedQty: 30,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },

  // =====================================================
  // PO 020
  // =====================================================
  {
    id: 1020,
    poNumber: "PO-TFI-020",
    customer: "PT Trafoindo Prima Perkasa",
    orderDate: "2026-08-20",
    deadline: "2026-09-15",
    status: "Order Masuk",
    totalValue: 42360000,

    items: [
      {
        id: "1020-1",
        name: "Frame Panel 1000x1500",
        code: "FRP-1015",
        qty: 12,
        price: 1350000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1020-2",
        name: "Door Panel 1000x1500",
        code: "DPR-1015",
        qty: 12,
        price: 975000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1020-3",
        name: "Base Panel 1000x1500",
        code: "BSP-1015",
        qty: 12,
        price: 525000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1020-4",
        name: "Cover Top Panel 1000x1500",
        code: "CTP-1015",
        qty: 12,
        price: 425000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
      {
        id: "1020-5",
        name: "Bracket Panel Heavy Duty",
        code: "BKP-HD01",
        qty: 36,
        price: 85000,
        production: {
          completedQty: 0,
        },
        qc: {
          passedQty: 0,
        },
      },
    ],

    delivery: {
      shipments: [],
    },
  },
];