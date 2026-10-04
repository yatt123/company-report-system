export function parsePOEmail(emailText) {
  if (!emailText || !emailText.trim()) {
    return {
      success: false,
      message: "Isi email masih kosong.",
      data: null,
    };
  }

  const text = emailText.replace(/\r/g, "").trim();

  // =========================
  // PO NUMBER
  // =========================
  const poMatch = text.match(
    /(?:PO\s*(?:Number|No|Nomor)?\s*[:#]?\s*)([A-Z0-9/.-]+)/i
  );

  const poNumber = poMatch?.[1]?.trim() || "";

  // =========================
  // CUSTOMER
  // =========================
  const customerMatch = text.match(
    /(?:Customer|Customer Name|Pelanggan)\s*[:\-]\s*(.+)/i
  );

  const customer = customerMatch?.[1]?.trim() || "";

  // =========================
  // ORDER DATE
  // =========================
  const orderDateMatch = text.match(
    /(?:Order Date|Tanggal PO|Tanggal Order)\s*[:\-]\s*(\d{4}-\d{2}-\d{2})/i
  );

  const orderDate =
    orderDateMatch?.[1] ||
    new Date().toISOString().split("T")[0];

  // =========================
  // DEADLINE
  // =========================
  const deadlineMatch = text.match(
    /(?:Deadline|Due Date|Delivery Date|Tanggal Deadline)\s*[:\-]\s*(\d{4}-\d{2}-\d{2})/i
  );

  const deadline = deadlineMatch?.[1] || "";

  // =========================
  // PRIORITY
  // =========================
  const priorityMatch = text.match(
    /(?:Priority|Prioritas)\s*[:\-]\s*(Low|Normal|High)/i
  );

  const priority =
    priorityMatch?.[1]
      ? priorityMatch[1].charAt(0).toUpperCase() +
        priorityMatch[1].slice(1).toLowerCase()
      : "Normal";

  // =========================
  // ITEMS
  //
  // Format yang didukung:
  //
  // Plate Support | PS-001 | 50 | 125000
  //
  // atau:
  //
  // Plate Support, PS-001, 50, 125000
  // =========================
  const lines = text.split("\n");

  const items = [];

  lines.forEach((line, index) => {
    const cleanLine = line.trim();

    if (!cleanLine) return;

    // Skip header
    if (
      /nama barang/i.test(cleanLine) &&
      /kode/i.test(cleanLine)
    ) {
      return;
    }

    let parts = cleanLine.includes("|")
      ? cleanLine.split("|")
      : cleanLine.split(",");

    parts = parts.map((part) => part.trim());

    if (parts.length < 4) return;

    const name = parts[0];
    const code = parts[1];

    const qty = Number(
      parts[2].replace(/[^\d]/g, "")
    );

    const unitPrice = Number(
      parts[3].replace(/[^\d]/g, "")
    );

    if (
      !name ||
      !code ||
      Number.isNaN(qty) ||
      Number.isNaN(unitPrice) ||
      qty <= 0
    ) {
      return;
    }

    items.push({
      id: Date.now() + index,
      name,
      code,
      qty,
      unitPrice,
    });
  });

  if (!poNumber) {
    return {
      success: false,
      message: "Nomor PO tidak ditemukan.",
      data: null,
    };
  }

  if (!customer) {
    return {
      success: false,
      message: "Customer tidak ditemukan.",
      data: null,
    };
  }

  if (!items.length) {
    return {
      success: false,
      message: "Item PO tidak ditemukan.",
      data: null,
    };
  }

  const totalValue = items.reduce(
    (total, item) =>
      total + item.qty * item.unitPrice,
    0
  );

  return {
    success: true,
    message: "PO berhasil dibaca.",
    data: {
      poNumber,
      customer,
      orderDate,
      deadline,
      priority,

      items,

      status: "Order Masuk",

      production: {
        completedQty: 0,
        rejectQty: 0,
        remainingQty: items.reduce(
          (total, item) => total + item.qty,
          0
        ),
      },

      delivery: {
        status: "Pending",
        deliveryDate: null,
        suratJalan: null,
        expedition: null,
        trackingNumber: null,
      },

      notes: "PO diimport dari email.",

      attachment: null,

      totalValue,
    },
  };
}