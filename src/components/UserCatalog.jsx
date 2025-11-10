import ProductCard from "./ProductCard";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function UserCatalog({ products, cart, changeQty, addToCart, view }) {
  return (
    <>
      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const item = cart.find((c) => c._id === p._id);
            return (
              <ProductCard key={p._id} product={p} qty={item?.qty || 0} onChangeQty={changeQty} onAdd={() => addToCart(p)} />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const item = cart.find((c) => c._id === p._id);
            const imgSrc = p.image ? (p.image.startsWith("/uploads") ? `${API}${p.image}` : p.image) : "https://images.unsplash.com/photo-1584270354949-c26b0d5b5a35?q=80&w=600&auto=format&fit=crop";
            return (
              <div key={p._id} className="rounded-2xl border border-gray-200 bg-white p-3">
                <div className="flex gap-3">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-50">
                    {p.in_stock === false && (
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-rose-600 text-white text-xs px-2 py-1">Stok habis</div>
                    )}
                    <img src={imgSrc} className={`h-full w-full object-cover ${p.in_stock === false ? "grayscale" : ""}`} />
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
    </>
  );
}
