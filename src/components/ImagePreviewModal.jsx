import React, { memo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ImagePreviewModal = memo(({ src, onClose }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

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
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [src, onClose]);

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

  if (!src) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div 
        ref={contentRef}
        className="bg-neutral-900 rounded-xl p-3 max-w-[95vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Full size preview"
          className="max-w-full max-h-[80vh] object-contain rounded-md"
        />
        <div className="flex justify-end mt-2">
          <button
            ref={closeButtonRef}
            onClick={handleCloseButtonClick}
            className="px-3 py-1 text-sm text-neutral-400 hover:text-white"
            aria-label="Close preview"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

ImagePreviewModal.displayName = 'ImagePreviewModal';

export default ImagePreviewModal;
