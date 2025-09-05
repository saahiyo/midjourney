import { useEffect } from "react";
import { X } from "lucide-react"; // optional close icon

export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  // Close modal with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // prevent background scroll

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (optional) */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>

        {/* Message */}
        <p className="text-neutral-300 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-neutral-300 hover:bg-neutral-700 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-700 text-white hover:bg-red-600 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
