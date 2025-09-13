// Toast.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X } from "lucide-react"; // small close icon (if using lucide-react)

const variantStyles = {
  success: "bg-emerald-700 border-emerald-500 text-white",
  error: "bg-red-700 border-red-500 text-white",
  warning: "bg-yellow-600 border-yellow-400 text-black",
  info: "bg-[#101011] border-neutral-600 text-white",
};

export default function Toast({
  message,
  onClose,
  duration = 3000,
  variant = "info",
}) {
  const toastRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (toastRef.current) {
      gsap.fromTo(toastRef.current,
        { opacity: 0, x: 100, scale: 0.8 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }

    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const handleClose = () => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        opacity: 0,
        x: 100,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const handleCloseButtonClick = () => {
    if (closeButtonRef.current) {
      gsap.to(closeButtonRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    handleClose();
  };

  return (
    <div
      ref={toastRef}
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg text-md ${variantStyles[variant]}`}
    >
      <span className="flex-1">{message}</span>
      <button
        ref={closeButtonRef}
        onClick={handleCloseButtonClick}
        className="hover:opacity-75"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
