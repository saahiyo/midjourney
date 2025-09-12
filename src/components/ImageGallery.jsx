import React, { memo, useMemo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import ElapsedTime from './ElapsedTime';

const ImageGallery = memo(({
  images,
  displayPrompt,
  displayAspectRatio,
  loading,
  progress,
  error,
  generationStartTime,
  dbEndTime,
  onImageClick,
}) => {
  const galleryRef = useRef(null);
  const imageRefs = useRef([]);

  // Deduplicate and normalize image URLs
  const displayImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    
    return Array.from(
      new Set(
        images
          .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') return item;
            // Handle different response shapes: { url } or { src }
            if (typeof item === 'object') {
              return item.url || item.src || JSON.stringify(item);
            }
            return String(item);
          })
          .filter(Boolean)
      )
    );
  }, [images]);

  useEffect(() => {
    if (displayImages.length > 0 && galleryRef.current) {
      gsap.fromTo(galleryRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [displayImages]);

  const handleImageClick = (src, index) => {
    if (imageRefs.current[index]) {
      gsap.to(imageRefs.current[index], {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    onImageClick(src);
  };

  // Clamp percentage position for progress bar
  const progressPosition = Math.min(98, Math.max(2, progress));

  if (displayImages.length === 0) {
    return (
      <div className="col-span-1 sm:col-span-2 p-6 flex text-gray-400 rounded-lg shadow-sm items-center justify-center h-full">
        {loading ? (
          <div className="w-full relative">
            <div className="w-full rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-3 bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`Generation progress: ${progress}%`}
              />
            </div>
            <div className="absolute left-0 top-0 w-full h-3 pointer-events-none">
              <div
                style={{ left: `${progressPosition}%` }}
                className="absolute -translate-x-1/2 -translate-y-6 text-xs text-gray-200 bg-gray-900 px-2 py-1 rounded shadow-sm"
              >
                {progress}%
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-gray-400">
              <ElapsedTime
                startTime={generationStartTime}
                loading={loading}
              />
              <div className="text-xs text-gray-500 mt-1">
                Image will be generated soon — this may take a few moments.
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="w-full flex flex-col items-center gap-2">
            <i className="ri-error-warning-line text-red-400 text-3xl" aria-hidden="true"></i>
            <p className="text-sm text-red-400 text-center" role="alert">
              {error}
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-3 border-b border-neutral-800 pb-2">
              <p className="text-sm font-medium text-gray-400 text-center">
                No images to display
              </p>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Quick tips: try{' '}
              <span className="text-gray-200">
                cinematic portrait, dramatic rim light
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="col-span-1 sm:col-span-2 p-2">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">
          Results: {displayImages.length}
        </p>
      </div>
      
      <div className="mb-2 border-t border-neutral-800 py-2">
        <p className="text-sm text-gray-200 truncate">
          <strong>Prompt:</strong> {displayPrompt}
        </p>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-xs text-gray-400">
            <i className="ri-layout-fill" aria-hidden="true"></i> 
            Aspect Ratio: {displayAspectRatio}
          </p>
          <ElapsedTime
            startTime={generationStartTime}
            endTime={dbEndTime || (!loading && Date.now())}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Large horizontally scrollable gallery */}
        <div 
          ref={galleryRef}
          className="flex gap-6 overflow-x-auto py-2 -mx-2 px-2 scrollbar-hide"
          role="region"
          aria-label="Generated images gallery"
        >
          {displayImages.map((src, idx) => (
            <div
              key={`${idx}-${src}`}
              className="flex-none w-44 sm:w-56 md:w-64"
            >
              <button
                ref={el => imageRefs.current[idx] = el}
                onClick={() => handleImageClick(src, idx)}
                className="block w-full h-72 sm:h-80 md:h-96 bg-black rounded-md overflow-hidden shadow-inner"
                aria-label={`Preview image ${idx + 1}`}
              >
                <img
                  src={src}
                  alt={`Generated image ${idx + 1} for prompt: ${displayPrompt}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          ))}
        </div>
        
        {/* Compact thumbnail strip */}
        <div 
          className="flex gap-3 overflow-x-auto py-1 -mx-2 px-2"
          role="region"
          aria-label="Image thumbnails"
        >
          {displayImages.map((src, idx) => (
            <button
              key={`thumb-${idx}-${src}`}
              onClick={() => handleImageClick(src, idx)}
              className="flex-none w-20 h-28 sm:w-24 sm:h-32 bg-black rounded-md overflow-hidden shadow-sm"
              aria-label={`Preview thumbnail ${idx + 1}`}
            >
              <img
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
