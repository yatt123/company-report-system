import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePO } from "../context/POContext";
import Button from "../components/ui/Button";

function InputPO() {
  const navigate = useNavigate();
  const { addOrder } = usePO();

  const [form, setForm] = useState({
    poNumber: "",
    customer: "",
    orderDate: new Date().toISOString().split("T")[0],
    deadline: "",
    priority: "Normal",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: "",
      code: "",
      qty: 1,
      unitPrice: 0,
    },
  ]);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateItem = (id, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "qty" || field === "unitPrice"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now() + Math.random(),
        name: "",
        code: "",
        qty: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) =>
        total + Number(item.qty || 0) * Number(item.unitPrice || 0),
      0
    );
  };

  const getTotalQty = () => {
    return items.reduce(
      (total, item) => total + Number(item.qty || 0),
      0
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!form.poNumber.trim()) {
      setError("Nomor PO wajib diisi.");
      return;
    }

    if (!form.customer.trim()) {
      setError("Customer wajib diisi.");
      return;
    }

    if (!form.orderDate) {
      setError("Tanggal PO wajib diisi.");
      return;
    }

    if (!form.deadline) {
      setError("Deadline wajib diisi.");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        !item.code.trim() ||
        Number(item.qty) <= 0 ||
        Number(item.unitPrice) < 0
    );

    if (invalidItem) {
      setError(
        "Pastikan semua item memiliki nama, kode, quantity, dan harga yang valid."
      );
      return;
    }

    const duplicatePO = false;

    if (duplicatePO) {
      setError("Nomor PO sudah digunakan.");
      return;
    }

    const newOrder = {
      poNumber: form.poNumber.trim(),
      customer: form.customer.trim(),
      orderDate: form.orderDate,
      deadline: form.deadline,
      priority: form.priority,

      items: items.map((item, index) => ({
        id: index + 1,
        name: item.name.trim(),
        code: item.code.trim(),
        qty: Number(item.qty),
        unitPrice: Number(item.unitPrice),
      })),

      status: "Order Masuk",

      production: {
        completedQty: 0,
        rejectQty: 0,
        remainingQty: getTotalQty(),
      },

      delivery: {
        status: "Pending",
        deliveryDate: null,
        suratJalan: null,
        expedition: null,
        trackingNumber: null,
      },

      notes: form.notes.trim(),

      attachment: null,
    };

    addOrder(newOrder);

    navigate("/purchase-orders");
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/purchase-orders")}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Purchase Order
      </button>

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          Purchase Order
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Input Purchase Order
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Tambahkan PO baru beserta seluruh item yang dipesan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Informasi PO
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Informasi utama purchase order.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Nomor PO
              </label>

              <input
                type="text"
                name="poNumber"
                value={form.poNumber}
                onChange={handleChange}
                placeholder="PO/TFI/2026/00126"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Customer
              </label>

              <input
                type="text"
                name="customer"
                value={form.customer}
                onChange={handleChange}
                placeholder="PT Trafoindo"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Tanggal PO
              </label>

              <input
                type="date"
                name="orderDate"
                value={form.orderDate}
                onChange={handleChange}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Deadline
              </label>

              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Catatan
              </label>

              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Catatan PO..."
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Item Purchase Order
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Tambahkan satu atau lebih barang dalam PO.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Tambah Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">
                    #
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Nama Barang
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Kode Barang
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Qty
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Harga Satuan
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Total
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Nama barang"
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "code",
                            e.target.value
                          )
                        }
                        placeholder="Kode"
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "qty",
                            e.target.value
                          )
                        }
                        className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            e.target.value
                          )
                        }
                        className="h-9 w-36 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        Number(item.qty || 0) *
                          Number(item.unitPrice || 0)
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
            <div>
              <p className="text-xs text-slate-400">
                Total Quantity
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {getTotalQty().toLocaleString("id-ID")} pcs
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Total Nilai PO
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatCurrency(getTotal())}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <Button type="submit">
            Simpan Purchase Order
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InputPO;