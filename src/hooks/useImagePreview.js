import { useState, useCallback, useEffect } from 'react';

export const useImagePreview = () => {
  const [previewSrc, setPreviewSrc] = useState(null);

  const openPreview = useCallback((src) => {
    setPreviewSrc(src);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewSrc(null);
  }, []);

  // Handle escape key to close preview
  useEffect(() => {
    if (!previewSrc) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closePreview();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [previewSrc, closePreview]);

  return {
    previewSrc,
    openPreview,
    closePreview,
    isPreviewOpen: !!previewSrc,
  };
};
