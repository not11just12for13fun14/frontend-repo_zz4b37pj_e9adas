import { Zap, Truck, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <Zap className="w-4 h-4" /> Promo Spesial Minggu Ini
            </div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Belanja kebutuhan harian lebih cepat dan hemat
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Pilih dari ribuan produk segar, kebutuhan rumah tangga, dan cemilan favorit dengan harga terbaik.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#products" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Mulai Belanja
              </a>
              <a href="#categories" className="px-5 py-3 rounded-xl bg-white text-emerald-700 font-semibold border border-emerald-200 hover:bg-emerald-50">
                Lihat Kategori
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Feature icon={<Truck className="w-5 h-5 text-emerald-600" />} title="Gratis Ongkir" subtitle=">100rb" />
              <Feature icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} title="Jaminan Segar" subtitle="100%" />
              <Feature icon={<Zap className="w-5 h-5 text-emerald-600" />} title="Cepat Sampai" subtitle="<2 jam" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-200/40 to-cyan-200/40 blur-2xl rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
              alt="Groceries"
              className="relative rounded-3xl shadow-2xl border border-white"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 backdrop-blur border border-emerald-100">
      <div className="p-2 rounded-lg bg-emerald-50">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600">{subtitle}</div>
      </div>
    </div>
  );
}
