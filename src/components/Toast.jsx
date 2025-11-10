import { useEffect } from "react";

export default function Toast({ toasts = [], onClose }) {
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => onClose(t.id), t.duration || 3000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, onClose]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-xs rounded-lg border p-3 shadow-md bg-white ${
            t.type === "success" ? "border-emerald-200" : t.type === "error" ? "border-rose-200" : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                t.type === "success" ? "bg-emerald-500" : t.type === "error" ? "bg-rose-500" : "bg-gray-400"
              }`}
            />
            <div className="text-sm text-gray-800">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
