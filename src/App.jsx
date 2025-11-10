import { useEffect, useMemo, useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ProductCard from "./components/ProductCard.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  // Catalog enhancements
  const [sortBy, setSortBy] = useState("relevance"); // relevance | price-asc | price-desc
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pc, cc] = await Promise.all([
        fetch(`${API}/products`).then((r) => r.json()),
        fetch(`${API}/categories`).then((r) => r.json()),
      ]);
      setProducts(pc);
      setCategories(cc);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, activeCat, minPrice, maxPrice, sortBy, perPage]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    let arr = products.filter((p) => {
      const matchesQ = !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchesC = !activeCat || p.category === activeCat;
      const price = Number(p.price) || 0;
      const matchesMin = min === null || price >= min;
      const matchesMax = max === null || price <= max;
      return matchesQ && matchesC && matchesMin && matchesMax;
    });

    if (sortBy === "price-asc") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    // relevance keeps original order

    return arr;
  }, [products, query, activeCat, minPrice, maxPrice, sortBy]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredSorted.slice(start, start + perPage);
  }, [filteredSorted, page, perPage]);

  const addToCart = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const subtotal = useMemo(() => cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0), [cart]);

  const clearFilters = () => {
    setQuery("");
    setActiveCat("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    setPerPage(12);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50">
      <Header onSearch={setQuery} cartCount={cart.length} />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section id="categories">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Kategori</h2>
            <div className="flex items-center gap-2">
              <button
                className={`text-sm px-3 py-1.5 rounded-lg border ${!activeCat ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200"}`}
                onClick={() => setActiveCat("")}
              >
                Semua
              </button>
              <button
                onClick={() => setAdminOpen((v) => !v)}
                className="text-sm px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50"
                title="Buka panel admin untuk input produk/kategori"
              >
                {adminOpen ? "Tutup Admin" : "Buka Admin"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveCat(c.slug)}
                className={`px-4 py-2 rounded-xl border whitespace-nowrap ${activeCat === c.slug ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 hover:border-emerald-200"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        {adminOpen && (
          <AdminPanel onDataChanged={loadData} />
        )}

        <section id="products" className="mt-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Produk</h2>
              <div className="text-gray-600 text-sm">{total} item ditemukan</div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-gray-600">Urutkan</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <option value="relevance">Paling relevan</option>
                  <option value="price-asc">Harga terendah</option>
                  <option value="price-desc">Harga tertinggi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Min Harga</label>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="mt-1 w-28 px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Max Harga</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="" className="mt-1 w-28 px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Tampilkan</label>
                <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>
              <button onClick={clearFilters} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />)
              )}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600">
              Tidak ada produk yang cocok dengan filter saat ini.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} onAdd={addToCart} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <div className="text-sm text-gray-700">
                    Halaman {page} / {totalPages}
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="mt-12 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold mb-3">Ringkasan Belanja</h3>
          {cart.length === 0 ? (
            <div className="text-gray-500">Keranjang kosong</div>
          ) : (
            <div className="space-y-2">
              {cart.map((i) => (
                <div key={i._id} className="flex items-center justify-between text-sm">
                  <div className="truncate mr-3">{i.title} × {i.qty}</div>
                  <div className="font-medium">Rp{(i.price * i.qty).toLocaleString("id-ID")}</div>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t flex items-center justify-between font-semibold">
                <div>Subtotal</div>
                <div>Rp{subtotal.toLocaleString("id-ID")}</div>
              </div>
              <button className="w-full mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Checkout
              </button>
            </div>
          )}
        </aside>
      </main>

      <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BlueMarket. All rights reserved.
      </footer>
    </div>
  );
}
