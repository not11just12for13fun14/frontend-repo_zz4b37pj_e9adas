import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function AdminPanel({ onDataChanged }) {
  const [tab, setTab] = useState("product");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Admin Panel</h3>
        <div className="flex gap-2 text-sm">
          <button onClick={() => setTab("product")} className={`px-3 py-1.5 rounded-lg border ${tab === "product" ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200"}`}>Produk</button>
          <button onClick={() => setTab("category")} className={`px-3 py-1.5 rounded-lg border ${tab === "category" ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200"}`}>Kategori</button>
        </div>
      </div>

      {message && (
        <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">{message}</div>
      )}

      {tab === "category" ? (
        <CategoryForm
          onCreated={() => {
            setMessage("Kategori berhasil ditambahkan.");
            fetchCategories();
            onDataChanged?.();
          }}
        />
      ) : (
        <ProductForm
          categories={categories}
          onCreated={() => {
            setMessage("Produk berhasil ditambahkan.");
            onDataChanged?.();
          }}
        />
      )}

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Kategori Tersedia</h4>
        {categories.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada kategori.</div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <span key={c._id} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{c.name} ({c.slug})</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryForm({ onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !slug) {
      setError("Nama dan slug wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug })
      });
      if (!res.ok) throw new Error("Gagal menambahkan kategori");
      setName("");
      setSlug("");
      onCreated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-3">
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: Buah" />
      </div>
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="buah" />
      </div>
      <div className="md:col-span-1 flex items-end">
        <button disabled={loading} type="submit" className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Tambah Kategori"}
        </button>
      </div>
      {error && <div className="md:col-span-3 text-sm text-red-600">{error}</div>}
    </form>
  );
}

function ProductForm({ categories, onCreated }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !price) {
      setError("Nama produk dan harga wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        price: Number(price),
        description,
        category,
        image,
      };
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menambahkan produk");
      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImage("");
      onCreated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: Apel Fuji 1kg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="25000" />
      </div>
      <div className="lg:col-span-1">
        <label className="block text-sm font-medium text-gray-700">Kategori</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg">
          <option value="">Pilih kategori</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2 lg:col-span-1">
        <label className="block text-sm font-medium text-gray-700">URL Gambar Produk</label>
        <input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="https://..." />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Tulis deskripsi singkat" />
      </div>
      <div className="md:col-span-2 lg:col-span-3 flex justify-end">
        <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Tambah Produk"}
        </button>
      </div>
      {error && <div className="md:col-span-2 lg:col-span-3 text-sm text-red-600">{error}</div>}
    </form>
  );
}
