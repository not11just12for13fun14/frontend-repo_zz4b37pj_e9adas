import { useState } from "react";

export default function CheckoutForm({ onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: name.trim(), email: email.trim(), address: address.trim(), coupon: coupon.trim().toUpperCase() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-gray-600">Nama</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama lengkap" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
      </div>
      <div>
        <label className="block text-xs text-gray-600">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nama@email.com" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
      </div>
      <div>
        <label className="block text-xs text-gray-600">Alamat</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} placeholder="Jalan, kota, kode pos" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
      </div>
      <div>
        <label className="block text-xs text-gray-600">Kode Kupon</label>
        <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Contoh: HEMAT10" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200" />
      </div>
      <button disabled={submitting} className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
        {submitting ? "Memproses..." : "Buat Pesanan"}
      </button>
    </form>
  );
}
