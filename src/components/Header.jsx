import { ShoppingCart, Search, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth, logout } from "../lib/auth";

export default function Header({ onSearch, cartCount, onCartClick }) {
  const [query, setQuery] = useState("");
  const [auth, setAuth] = useState(getAuth());

  useEffect(() => {
    const onStorage = () => setAuth(getAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleLogout = () => {
    logout();
    setAuth(null);
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <a href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          GreenFood
        </a>
        <form onSubmit={submit} className={`hidden md:flex items-center gap-2 flex-1 max-w-xl ml-4 ${auth?.user?.role === 'admin' ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk segar, promo, dll"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Cari
          </button>
        </form>
        <div className="ml-auto flex items-center gap-3">
          {auth ? (
            <>
              <span className="text-sm text-gray-700 hidden sm:inline">{auth.user?.name} ({auth.user?.role})</span>
              {auth.user?.role === 'user' && (
                <button onClick={onCartClick} className="relative p-2 rounded-md hover:bg-gray-100" aria-label="Buka keranjang">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <a href="/login" className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 text-sm">
              <LogIn className="w-4 h-4" /> Login
            </a>
          )}
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={submit} className={`flex items-center gap-2 ${auth?.user?.role === 'admin' ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Cari
          </button>
        </form>
      </div>
    </header>
  );
}
