import { useEffect, useState } from "react";
import Header from "../components/Header";
import AdminPanel from "../components/AdminPanel";
import { getAuth } from "../lib/auth";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function AdminPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.user?.role !== "admin") {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin</h1>
          <p className="text-gray-600 mb-6">Kelola kategori, produk, unggah QRIS, dan verifikasi top up.</p>
        </section>

        <AdminPanel onDataChanged={() => {
          fetch(`${API}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
        }} />

        <QrisUploader />
        <TopupApprovals />
      </main>

      <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} GreenFood Admin.
      </footer>
    </div>
  );
}

function QrisUploader() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const auth = getAuth();
      if (!auth) throw new Error("Harus login admin");
      const fd = new FormData();
      if (file) fd.set("image", file);
      const r = await fetch(`${API}/settings/qris`, { method: "POST", headers: { Authorization: `Bearer ${auth.token}` }, body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Gagal unggah QRIS");
      setMsg("QRIS berhasil diperbarui");
    } catch (e) { setMsg(e.message); }
  };

  return (
    <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold mb-3">Unggah QRIS GreenPay</h3>
      <form onSubmit={submit} className="flex items-end gap-3">
        <div>
          <label className="block text-sm text-gray-700">Gambar QRIS</label>
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="mt-1 w-64 px-3 py-2 border border-gray-200 rounded-lg" />
        </div>
        <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Simpan QRIS</button>
      </form>
      {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
    </section>
  );
}

function TopupApprovals() {
  const [rows, setRows] = useState([]);
  const load = async () => {
    try {
      const auth = getAuth();
      if (!auth) return;
      const r = await fetch(`${API}/admin/topup-requests`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const d = await r.json();
      if (r.ok) setRows(d);
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const act = async (id, approve) => {
    try {
      const auth = getAuth();
      const path = approve ? "approve" : "reject";
      const r = await fetch(`${API}/admin/topup-requests/${id}/${path}`, { method: "POST", headers: { Authorization: `Bearer ${auth.token}` } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Gagal aksi");
      await load();
    } catch {}
  };

  return (
    <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold mb-3">Verifikasi Top Up</h3>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">Belum ada pengajuan top up.</div>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r._id} className="flex items-center gap-3 border rounded-xl p-3">
              {r.proof && <img src={`${API}${r.proof}`} className="w-16 h-16 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{r.email}</div>
                <div className="text-sm text-gray-600">Nominal: Rp{Number(r.amount||0).toLocaleString("id-ID")} • Status: {r.status}</div>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={()=>act(r._id, true)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm">Setujui</button>
                  <button onClick={()=>act(r._id, false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm">Tolak</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
