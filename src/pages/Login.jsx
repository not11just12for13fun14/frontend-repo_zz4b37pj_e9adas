import { useState } from "react";
import Toast from "../components/Toast";
import { setAuth } from "../lib/auth";

const API = import.meta.env.VITE_BACKEND_URL || "";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, type, duration }]);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const submit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isRegister) {
        const fd = new FormData();
        fd.set("name", name.trim());
        fd.set("email", email.trim());
        fd.set("password", password);
        res = await fetch(`${API}/auth/register`, { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json()).detail || "Gagal register");
        addToast("Registrasi sukses, silakan login", "success");
        setIsRegister(false);
        return;
      } else {
        const fd = new FormData();
        fd.set("email", email.trim());
        fd.set("password", password);
        res = await fetch(`${API}/auth/login`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login gagal");
        setAuth({ token: data.access_token, user: data.user });
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (e) {
      addToast(e.message, "error", 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center">{isRegister ? "Daftar Akun GreenFood" : "Masuk ke GreenFood"}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm text-gray-700">Nama</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Nama lengkap" />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="nama@email.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="••••••••" />
          </div>
          <button className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">{isRegister ? "Daftar" : "Masuk"}</button>
        </form>
        <div className="mt-4 text-sm text-center">
          {isRegister ? (
            <button onClick={() => setIsRegister(false)} className="text-emerald-700 hover:underline">Sudah punya akun? Masuk</button>
          ) : (
            <button onClick={() => setIsRegister(true)} className="text-emerald-700 hover:underline">Belum punya akun? Daftar</button>
          )}
        </div>
      </div>
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}
