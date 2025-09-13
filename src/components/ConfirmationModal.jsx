// ConfirmationModal.jsx
import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  /* ---- simple focus trap helpers ---- */
  const getFocusable = () =>
    panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

  const trapFocus = () => {
    const nodes = Array.from(getFocusable());
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (!first) return;
    first.focus();

    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panelRef.current.addEventListener('keydown', handler);
    return () => {
      if (panelRef.current) {
        panelRef.current.removeEventListener('keydown', handler);
      }
    };
  };

  /* ---- animations ---- */
  const animateIn = useCallback(() => {
    if (REDUCED) {
      gsap.set([backdropRef.current, panelRef.current], { opacity: 1 });
      return;
    }
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }
    );
  }, []);

  const animateOut = useCallback(
    (cb) => {
      if (REDUCED) {
        cb?.();
        return;
      }
      gsap.to(panelRef.current, { opacity: 0, scale: 0.95, duration: 0.15 });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.15,
        onComplete: cb,
      });
    },
    []
  );

  /* ---- open / close ---- */
  const close = useCallback(() => animateOut(onCancel), [animateOut, onCancel]);

  useEffect(() => {
    if (!isOpen) return;

    lastFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    animateIn();
    const untrap = trapFocus();

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (untrap) untrap();
      document.body.style.overflow = '';
      lastFocused.current?.focus();
    };
  }, [isOpen, animateIn, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        ref={backdropRef}
        onClick={close}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden
      />

      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-sm rounded-2xl bg-[#101011]/90 p-6 shadow-2xl ring-1 ring-white/10"
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 id="modal-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p className="mt-2 text-gray-500 tracking-tight">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-full px-4 py-2 text-gray-300 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-4 py-2 text-white hover:bg-red-500 active:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}