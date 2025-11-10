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
  const [cartOpen, setCartOpen] = useState(false);

  // Catalog enhancements
  const [sortBy, setSortBy] = useState("relevance"); // relevance | price-asc | price-desc
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [view, setView] = useState("grid"); // grid | list

  // URL sync helpers
  const applyFromUrl = useCallback(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get("q") || "");
    setActiveCat(p.get("cat") || "");
    setSortBy(p.get("sort") || "relevance");
    setMinPrice(p.get("min") || "");
    setMaxPrice(p.get("max") || "");
    setPerPage(Number(p.get("pp")) || 12);
    setPage(Number(p.get("page")) || 1);
    setOnlyAvailable(p.get("avail") === "1");
    setView(p.get("view") === "list" ? "list" : "grid");
  }, []);

  const pushToUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (activeCat) p.set("cat", activeCat);
    if (sortBy !== "relevance") p.set("sort", sortBy);
    if (minPrice !== "") p.set("min", String(minPrice));
    if (maxPrice !== "") p.set("max", String(maxPrice));
    if (perPage !== 12) p.set("pp", String(perPage));
    if (page !== 1) p.set("page", String(page));
    if (onlyAvailable) p.set("avail", "1");
    if (view !== "grid") p.set("view", view);
    const next = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, "", next);
  }, [query, activeCat, sortBy, minPrice, maxPrice, perPage, page, onlyAvailable, view]);

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
    applyFromUrl();
    loadData();
  }, [applyFromUrl, loadData]);

  // Reset page when filters change (except direct page edits)
  useEffect(() => {
    setPage(1);
  }, [query, activeCat, minPrice, maxPrice, sortBy, perPage, onlyAvailable]);

  // Keep URL in sync
  useEffect(() => {
    pushToUrl();
  }, [pushToUrl]);

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
      const matchesAvail = !onlyAvailable || p.in_stock !== false;
      return matchesQ && matchesC && matchesMin && matchesMax && matchesAvail;
    });

    if (sortBy === "price-asc") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    // relevance keeps original order

    return arr;
  }, [products, query, activeCat, minPrice, maxPrice, sortBy, onlyAvailable]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredSorted.slice(start, start + perPage);
  }, [filteredSorted, page, perPage]);

  const changeQty = (product, nextQty) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        if (nextQty <= 0) copy.splice(idx, 1);
        else copy[idx] = { ...copy[idx], qty: nextQty };
        return copy;
      }
      if (nextQty > 0) return [...prev, { ...product, qty: nextQty }];
      return prev;
    });
  };

  const addToCart = (product) => changeQty(product, 1);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0), [cart]);

  const clearFilters = () => {
    setQuery("");
    setActiveCat("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    setPerPage(12);
    setOnlyAvailable(false);
    setView("grid");
  };

  const checkout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong");
    try {
      const payload = {
        buyer_name: "Guest",
        buyer_email: "guest@example.com",
        buyer_address: "N/A",
        items: cart.map((c) => ({
          product_id: c._id,
          title: c.title,
          price: c.price,
          quantity: c.qty,
          image: c.image || null,
        })),
        subtotal,
        delivery_fee: 0,
        total: subtotal,
        status: "pending",
      };
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal membuat pesanan");
      alert(`Pesanan berhasil! ID: ${data._id}`);
      setCart([]);
      setCartOpen(false);
    } catch (e) {
      console.error(e);
      alert(`Checkout gagal: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50">
      <Header onSearch={setQuery} cartCount={cart.length} onCartClick={() => setCartOpen(true)} />
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
              <div className="flex items-center gap-2 mt-6">
                <input id="avail" type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
                <label htmlFor="avail" className="text-sm text-gray-700">Hanya tersedia</label>
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
              <div>
                <label className="block text-xs text-gray-600">Tampilan</label>
                <select value={view} onChange={(e) => setView(e.target.value)} className="mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
              <button onClick={clearFilters} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
            </div>
          </div>

          {loading ? (
            <div className={`${view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}`}>
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
              {view === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pageItems.map((p) => {
                    const item = cart.find((c) => c._id === p._id);
                    return (
                      <ProductCard key={p._id} product={p} qty={item?.qty || 0} onChangeQty={changeQty} onAdd={addToCart} />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {pageItems.map((p) => {
                    const item = cart.find((c) => c._id === p._id);
                    return (
                      <div key={p._id} className="rounded-2xl border border-gray-200 bg-white p-3">
                        <div className="flex gap-3">
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-50">
                            {p.in_stock === false && (
                              <div className="absolute left-2 top-2 z-10 rounded-full bg-rose-600 text-white text-xs px-2 py-1">Stok habis</div>
                            )}
                            <img src={p.image || "https://images.unsplash.com/photo-1584270354949-c26b0d5b5a35?q=80&w=600&auto=format&fit=crop"} className={`h-full w-full object-cover ${p.in_stock === false ? "grayscale" : ""}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-2">{p.title}</h3>
                              <div className="text-emerald-700 font-bold">Rp{p.price?.toLocaleString("id-ID")}</div>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{p.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{p.category}</span>
                              {(item?.qty || 0) > 0 ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => changeQty(p, Math.max(0, (item?.qty || 0) - 1))} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50">-</button>
                                  <span className="min-w-[1.5rem] text-center text-sm font-medium">{item?.qty || 0}</span>
                                  <button onClick={() => changeQty(p, (item?.qty || 0) + 1)} disabled={p.in_stock === false} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">+</button>
                                </div>
                              ) : (
                                <button onClick={() => changeQty(p, 1)} disabled={p.in_stock === false} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                                  Tambah
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

        <aside className="mt-12 rounded-2xl border border-gray-200 bg-white p-5 hidden md:block">
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
              <button onClick={checkout} className="w-full mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Checkout
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[26rem] bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Keranjang</h3>
              <button onClick={() => setCartOpen(false)} className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">Tutup</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-gray-500">Keranjang kosong</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((i) => (
                    <div key={i._id} className="flex items-start gap-3">
                      <img src={i.image || "https://images.unsplash.com/photo-1584270354949-c26b0d5b5a35?q=80&w=300&auto=format&fit=crop"} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{i.title}</div>
                        <div className="text-emerald-700 font-semibold">Rp{i.price?.toLocaleString("id-ID")}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => changeQty(i, Math.max(0, i.qty - 1))} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50">-</button>
                          <span className="min-w-[1.5rem] text-center text-sm font-medium">{i.qty}</span>
                          <button onClick={() => changeQty(i, i.qty + 1)} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between font-semibold">
                <div>Subtotal</div>
                <div>Rp{subtotal.toLocaleString("id-ID")}</div>
              </div>
              <button onClick={checkout} className="w-full mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BlueMarket. All rights reserved.
      </footer>
    </div>
  );
}
