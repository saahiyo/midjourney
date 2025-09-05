// Toast.jsx
import { useEffect } from "react";
import { X } from "lucide-react"; // small close icon (if using lucide-react)

const variantStyles = {
  success: "bg-emerald-700 border-emerald-500 text-white",
  error: "bg-red-700 border-red-500 text-white",
  warning: "bg-yellow-600 border-yellow-400 text-black",
  info: "bg-neutral-900 border-neutral-600 text-white",
};

export default function Toast({
  message,
  onClose,
  duration = 3000,
  variant = "info",
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border text-sm animate-slideIn ${variantStyles[variant]}`}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="hover:opacity-75 transition"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
