export default function ProductCard({ product, onAdd }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-3 hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-50">
        <img
          src={product.image || "https://images.unsplash.com/photo-1584270354949-c26b0d5b5a35?q=80&w=600&auto=format&fit=crop"}
          alt={product.title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
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
          <button onClick={() => onAdd?.(product)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
