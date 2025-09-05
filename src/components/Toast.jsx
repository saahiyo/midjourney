// Toast.jsx
import { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // auto close after 2s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-neutral-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg border border-neutral-600 animate-fadeIn">
      {message}
    </div>
  );
}
