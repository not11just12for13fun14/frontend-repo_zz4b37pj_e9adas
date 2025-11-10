import { ShoppingCart, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header({ onSearch, cartCount, onCartClick, role = "user", onRoleChange }) {
  const [query, setQuery] = useState("");
  const [internalRole, setInternalRole] = useState(role);

  useEffect(() => setInternalRole(role), [role]);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleRole = (e) => {
    const r = e.target.value;
    setInternalRole(r);
    onRoleChange?.(r);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          BlueMarket
        </div>
        <form onSubmit={submit} className={`hidden md:flex items-center gap-2 flex-1 max-w-xl ml-4 ${role === 'admin' ? 'pointer-events-none opacity-50' : ''}`}>
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
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600">Role</span>
            <select value={internalRole} onChange={handleRole} className="text-sm px-2 py-1 border border-gray-200 rounded-md bg-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {role === 'user' && (
            <button onClick={onCartClick} className="relative p-2 rounded-md hover:bg-gray-100" aria-label="Buka keranjang">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Role</span>
            <select value={internalRole} onChange={handleRole} className="text-sm px-2 py-1 border border-gray-200 rounded-md bg-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <form onSubmit={submit} className={`flex items-center gap-2 ${role === 'admin' ? 'pointer-events-none opacity-50' : ''}`}>
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
