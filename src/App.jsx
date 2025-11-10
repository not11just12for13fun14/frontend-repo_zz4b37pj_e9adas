import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ProductCard from "./components/ProductCard.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Toast from "./components/Toast.jsx";
import CheckoutForm from "./components/CheckoutForm.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "";

// This App keeps backward compatibility but now supports role switching UI
export default function App() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  // minimal shell that forwards to the appropriate page while preserving the old single page behavior
  const goRole = (r) => {
    setRole(r);
    if (r === "admin") navigate("/admin");
    else navigate("/");
  };

  // Keep original home UI for user role in this component for backward compatibility
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [sortBy, setSortBy] = useState("relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [view, setView] = useState("grid");

  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, type, duration }]);
    return id;
  }, []);
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

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
      addToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { applyFromUrl(); loadData(); }, [applyFromUrl, loadData]);
  useEffect(() => { try { const raw = localStorage.getItem("cart"); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setCart(parsed); } } catch (_) {} }, []);
  useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (_) {} }, [cart]);
  useEffect(() => { setPage(1); }, [query, activeCat, minPrice, maxPrice, sortBy, perPage, onlyAvailable]);
  useEffect(() => { pushToUrl(); }, [pushToUrl]);

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
    return arr;
  }, [products, query, activeCat, minPrice, maxPrice, sortBy, onlyAvailable]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = useMemo(() => { const start = (page - 1) * perPage; return filteredSorted.slice(start, start + perPage); }, [filteredSorted, page, perPage]);

  const changeQty = (product, nextQty) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i._id === product._id);
      if (idx >= 0) { const copy = [...prev]; if (nextQty <= 0) copy.splice(idx, 1); else copy[idx] = { ...copy[idx], qty: nextQty }; return copy; }
      if (nextQty > 0) return [...prev, { ...product, qty: nextQty }];
      return prev;
    });
  };
  const addToCart = (product) => changeQty(product, 1);
  const subtotal = useMemo(() => cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0), [cart]);

  const computeTotals = useCallback((currentSubtotal, couponCode) => {
    let discount = 0; let deliveryFee = currentSubtotal > 0 ? 15000 : 0; let applied = null; const code = (couponCode || "").trim().toUpperCase();
    if (!currentSubtotal) return { discount: 0, deliveryFee: 0, total: 0, applied };
    if (code === "HEMAT10") { discount = Math.min(currentSubtotal * 0.1, 50000); applied = "Diskon 10% (maks Rp50.000)"; }
    else if (code === "DISKON20") { discount = Math.min(currentSubtotal * 0.2, 100000); applied = "Diskon 20% (maks Rp100.000)"; }
    else if (code === "GRATISONGKIR") { deliveryFee = 0; applied = "Gratis ongkir"; }
    const total = Math.max(0, Math.round(currentSubtotal - discount + deliveryFee));
    return { discount: Math.round(discount), deliveryFee, total, applied };
  }, []);

  const [lastCoupon, setLastCoupon] = useState("");
  const { discount, deliveryFee, total: grandTotal, applied: appliedCoupon } = useMemo(() => computeTotals(subtotal, lastCoupon), [subtotal, lastCoupon, computeTotals]);

  const checkout = async ({ name, email, address, coupon }) => {
    if (cart.length === 0) return;
    const emailOk = /.+@.+\..+/.test(email || "");
    if (!name || !emailOk || !address) { return; }
    setLastCoupon(coupon || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50">
      <Header onSearch={setQuery} cartCount={cart.length} onCartClick={() => setCartOpen(true)} role={role} onRoleChange={goRole} />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section id="categories" className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Kategori</h2>
          <button onClick={() => setAdminOpen((v) => !v)} className="text-sm px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50">
            {adminOpen ? "Tutup Admin" : "Buka Admin"}
          </button>
        </section>

        {role === "admin" ? (
          <AdminPanel onDataChanged={loadData} />
        ) : (
          <section id="products">
            <div className="text-gray-600 text-sm mb-3">{filteredSorted.length} item ditemukan</div>
            <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>
              {pageItems.map((p) => {
                const item = cart.find((c) => c._id === p._id);
                return (
                  <ProductCard key={p._id} product={p} qty={item?.qty || 0} onChangeQty={changeQty} onAdd={addToCart} />
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Toast toasts={toasts} onClose={removeToast} />

      <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} BlueMarket. All rights reserved.</footer>
    </div>
  );
}
