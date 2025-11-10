import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ProductCard from "./components/ProductCard.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
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
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQ = !query || p.title?.toLowerCase().includes(query.toLowerCase());
      const matchesC = !activeCat || p.category === activeCat;
      return matchesQ && matchesC;
    });
  }, [products, query, activeCat]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50">
      <Header onSearch={setQuery} cartCount={cart.length} />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section id="categories">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Kategori</h2>
            <button
              className={`text-sm px-3 py-1.5 rounded-lg border ${!activeCat ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200"}`}
              onClick={() => setActiveCat("")}
            >
              Semua
            </button>
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

        <section id="products" className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Produk</h2>
            <div className="text-gray-600">{filtered.length} item</div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} onAdd={addToCart} />
              ))}
            </div>
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
