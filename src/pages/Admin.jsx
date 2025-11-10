import { useEffect, useState } from "react";
import Header from "../components/Header";
import AdminPanel from "../components/AdminPanel";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function AdminPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50">
      <Header role="admin" onRoleChange={(r) => {
        if (r === "user") {
          window.location.href = "/";
        }
      }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin</h1>
          <p className="text-gray-600 mb-6">Kelola kategori dan produk. Aksi simpan hanya dapat dilakukan oleh admin.</p>
        </section>

        <AdminPanel onDataChanged={() => {
          fetch(`${API}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
        }} />
      </main>

      <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BlueMarket Admin.
      </footer>
    </div>
  );
}
