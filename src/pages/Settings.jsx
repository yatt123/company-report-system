import { useState } from "react";
import {
  Database,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { usePO } from "../context/POContext";

function Settings() {
  const {
    orders,
    resetToDemoData,
    clearAllOrders,
  } = usePO();

  const [message, setMessage] = useState(null);

  /* =======================================================
     RESET 20 DATA DEMO
  ======================================================= */

  const handleResetDemo = () => {
    const confirmed = window.confirm(
      "RESET KE 20 DATA DEMO?\n\n" +
        "Semua perubahan data PO saat ini akan diganti " +
        "dengan data demo dari orders.js.\n\n" +
        "Production, QC, dan Delivery akan kembali ke kondisi awal.\n\n" +
        "Lanjutkan?"
    );

    if (!confirmed) return;

    const success = resetToDemoData();

    if (success) {
      setMessage({
        type: "success",
        text: "20 data PO demo berhasil dipulihkan.",
      });
    } else {
      setMessage({
        type: "error",
        text: "Gagal mereset data demo.",
      });
    }
  };

  /* =======================================================
     HAPUS SEMUA DATA
  ======================================================= */

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      "HAPUS SEMUA DATA PO?\n\n" +
        "Semua PO akan dihapus dan jumlah PO menjadi 0.\n\n" +
        "Data yang sedang tersimpan akan hilang dari sistem.\n\n" +
        "Kamu masih bisa mengembalikan PO 001–020 melalui " +
        "tombol 'Reset 20 Data Demo'.\n\n" +
        "Lanjutkan?"
    );

    if (!confirmed) return;

    const success = clearAllOrders();

    if (success) {
      setMessage({
        type: "success",
        text: "Semua data PO berhasil dihapus. Total PO sekarang 0.",
      });
    } else {
      setMessage({
        type: "error",
        text: "Gagal menghapus semua data PO.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Kelola konfigurasi dan data sistem Purchase Order.
        </p>
      </div>

      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0"
            />
          )}

          <div>
            <p className="text-sm font-medium">
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* ===================================================
          DATA SYSTEM
      =================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}

        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Database
                size={20}
                className="text-gray-700"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Data System
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Kelola data Purchase Order yang tersimpan
                di browser.
              </p>
            </div>
          </div>
        </div>

        {/* Current data */}

        <div className="px-6 py-5">
          <div className="mb-5 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Data PO
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Jumlah PO yang saat ini tersimpan.
                </p>
              </div>

              <div className="text-2xl font-bold text-gray-900">
                {orders.length}
              </div>
            </div>
          </div>

          {/* Buttons */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* RESET DEMO */}

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <RotateCcw
                    size={20}
                    className="text-blue-700"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Reset 20 Data Demo
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Mengembalikan PO 001–020 ke kondisi
                    awal untuk kebutuhan demo/testing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDemo}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <RotateCcw size={16} />

                Reset 20 Data Demo
              </button>
            </div>

            {/* DELETE ALL */}

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                  <Trash2
                    size={20}
                    className="text-red-700"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Hapus Semua Data PO
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Menghapus seluruh PO dari sistem dan
                    membuat jumlah data menjadi 0.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearAllData}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                <Trash2 size={16} />

                Hapus Semua Data PO
              </button>
            </div>
          </div>

          {/* Warning */}

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-medium text-amber-800">
                Catatan
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Data PO disimpan menggunakan localStorage
                browser. Untuk kebutuhan demo, gunakan
                <strong> Hapus Semua Data PO </strong>
                untuk membuat kondisi 0 PO. Gunakan
                <strong> Reset 20 Data Demo </strong>
                untuk mengembalikan data contoh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;