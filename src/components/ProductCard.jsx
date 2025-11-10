export default function ProductCard({ product, qty = 0, onChangeQty, onAdd }) {
  const out = product.in_stock === false;

  const inc = () => {
    const next = qty + 1;
    onChangeQty ? onChangeQty(product, next) : onAdd?.(product);
  };
  const dec = () => {
    const next = Math.max(0, qty - 1);
    onChangeQty && onChangeQty(product, next);
  };

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-3 hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
        {out && (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-rose-600 text-white text-xs px-2 py-1">Stok habis</div>
        )}
        <img
          src={product.image || "https://images.unsplash.com/photo-1584270354949-c26b0d5b5a35?q=80&w=600&auto=format&fit=crop"}
          alt={product.title}
          className={`h-full w-full object-cover transition-transform ${out ? "grayscale" : "group-hover:scale-[1.03]"}`}
        />
      </div>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
          <div className="text-emerald-700 font-bold">Rp{product.price?.toLocaleString("id-ID")}</div>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{product.category}</span>
          {qty > 0 ? (
            <div className="flex items-center gap-2">
              <button onClick={dec} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50">-</button>
              <span className="min-w-[1.5rem] text-center text-sm font-medium">{qty}</span>
              <button onClick={inc} disabled={out} className="w-8 h-8 grid place-items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">+</button>
            </div>
          ) : (
            <button onClick={inc} disabled={out} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
              Tambah
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
