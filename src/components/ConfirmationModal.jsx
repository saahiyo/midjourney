import { useEffect, useRef } from "react";
import { gsap } from "gsap";
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
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Close modal with Escape key and handle animations
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // prevent background scroll

    // Animate modal in
    if (modalRef.current && contentRef.current) {
      gsap.fromTo(modalRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      
      gsap.fromTo(contentRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.2,
        ease: "power2.in"
      });
      
      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: onCancel
      });
    } else {
      onCancel();
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

  const handleCancelClick = () => {
    if (cancelButtonRef.current) {
      gsap.to(cancelButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    handleClose();
  };

  const handleConfirmClick = () => {
    if (confirmButtonRef.current) {
      gsap.to(confirmButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        className="bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (optional) */}
        <button
          ref={closeButtonRef}
          onClick={handleCloseButtonClick}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white"
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
            ref={cancelButtonRef}
            onClick={handleCancelClick}
            className="px-4 py-2 rounded-full text-neutral-300 hover:bg-neutral-700"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirmClick}
            className="px-4 py-2 rounded-full bg-red-700 text-white hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
