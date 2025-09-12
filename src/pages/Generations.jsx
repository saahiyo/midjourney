import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth.jsx";
import Toast from "../components/Toast";
import ConfirmationModal from "../components/ConfirmationModal";

// Loading skeleton
const GenerationSkeleton = React.memo(({ index = 0 }) => {
  const skeletonRef = useRef(null);
  const shimmerRefs = useRef([]);

  useEffect(() => {
    if (skeletonRef.current) {
      // Animate skeleton entrance with stagger based on index
      gsap.fromTo(skeletonRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          ease: "power2.out",
          delay: index * 0.1
        }
      );

      // Create shimmer animation for all shimmer elements
      shimmerRefs.current.forEach((ref, shimmerIndex) => {
        if (ref) {
          gsap.to(ref, {
            opacity: 0.3,
            duration: 1.2,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
            delay: (index * 0.1) + (shimmerIndex * 0.1)
          });
        }
      });
    }
  }, [index]);

  return (
    <div ref={skeletonRef} className="bg-neutral-800 p-2 rounded-xl shadow-md flex flex-col gap-3 border border-transparent min-h-[240px]">
      <div className="px-1">
        <div ref={el => shimmerRefs.current[0] = el} className="h-4 bg-neutral-700 rounded mb-2 w-3/4"></div>
        <div ref={el => shimmerRefs.current[1] = el} className="h-3 bg-neutral-700 rounded w-2/3"></div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-grow px-1">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            ref={el => shimmerRefs.current[i + 2] = el}
            className="aspect-square bg-neutral-700 rounded-lg" 
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-neutral-700 px-1">
        <div ref={el => shimmerRefs.current[6] = el} className="h-8 bg-neutral-700 rounded w-1/2"></div>
        <div ref={el => shimmerRefs.current[7] = el} className="h-8 bg-neutral-700 rounded w-24"></div>
      </div>
    </div>
  );
});

// Error message
const ErrorMessage = React.memo(({ message, onRetry }) => {
  const errorRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (errorRef.current) {
      gsap.fromTo(errorRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const handleRetryClick = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    onRetry();
  };

  return (
    <div ref={errorRef} className="text-center py-12">
      <div className="text-red-400 mb-4">{message}</div>
      {onRetry && (
        <button
          ref={buttonRef}
          onClick={handleRetryClick}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
        >
          Try Again
        </button>
      )}
    </div>
  );
});

// Empty state
const EmptyState = React.memo(() => {
  const emptyRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    if (emptyRef.current && titleRef.current && subtitleRef.current) {
      gsap.fromTo(emptyRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
      
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" }
      );
      
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={emptyRef} className="text-center py-16">
      <div ref={titleRef} className="text-gray-500 text-lg mb-2">
        No generations found
      </div>
      <p ref={subtitleRef} className="text-gray-400 text-sm">
        Your saved AI generations will appear here
      </p>
    </div>
  );
});

// Card
const GenerationCard = React.memo(({
  generation,
  onRequestDelete,
  onPreview,
  showToast,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef(null);
  const pollingButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const handleDeleteClick = () => {
    onRequestDelete(generation.id, () => setIsDeleting(false));
  };

  const handlePolling = () => {
    if (pollingButtonRef.current) {
      gsap.to(pollingButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    if (!generation.polling_url) {
      showToast("Polling URL not available for this generation");
      return;
    }
    window.open(generation.polling_url, "_blank");
  };

  const handleDeleteButtonClick = () => {
    if (deleteButtonRef.current) {
      gsap.to(deleteButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    handleDeleteClick();
  };

  return (
    <div ref={cardRef} className="bg-neutral-800 p-2 rounded-xl shadow-md flex flex-col gap-3 border border-transparent hover:border-emerald-700/50">
      <div className="grid grid-cols-2 gap-2 flex-grow">
        {(generation.images || []).slice(0, 4).map((src, i) => (
          <div key={i} className="aspect-square">
            <img
              src={src}
              alt={`Generation ${generation.id} - Image ${i + 1}`}
              className="w-full h-full object-cover rounded-lg cursor-pointer border-1 border-neutral-900 hover:border-emerald-500"
              onClick={() => onPreview(generation, src)}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-neutral-700">
        <button
          ref={pollingButtonRef}
          onClick={handlePolling}
          className="flex-1 px-3 py-1.5 rounded bg-gray-900 text-xs text-gray-300 hover:bg-emerald-700 hover:text-white"
        >
          <i className="ri-link mr-2"></i>
          Open Polling
        </button>

        <button
          ref={deleteButtonRef}
          onClick={handleDeleteButtonClick}
          disabled={isDeleting}
          className="px-3 py-1.5 rounded bg-red-900 text-xs text-red-300 hover:bg-red-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ri-delete-bin-line mr-2"></i>
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
});

// Preview modal
const ImagePreview = React.memo(({ generation, src, onClose }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

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
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

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

  const formatDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(generation.created_at)),
    [generation.created_at]
  );

  const formatTime = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(generation.created_at)),
    [generation.created_at]
  );

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        ref={contentRef}
        className="bg-neutral-900 rounded-lg p-2 shadow-2xl border border-emerald-700/50 max-w-3xl w-full flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-md"
        />
        <div className="text-gray-300 text-xs bg-gray-800 p-2 rounded-md">
          <p className="font-mono text-sm text-white mb-2">
            {generation.prompt}
          </p>
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {formatDate} at {formatTime}
            </span>
            <span>{generation.aspect_ratio}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const Generations = React.memo(function Generations() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [savedGenerations, setSavedGenerations] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPolling, setShowPolling] = useState(false);
  const backButtonRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    generationId: null,
    onComplete: null,
  });

  const loadGenerations = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from("generations")
        .select(
          "id, api_id, polling_url, prompt, aspect_ratio, images, created_at, user_id"
        );
      
      // Admin users can see all generations, regular users only see their own
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      const sanitized = (data || []).map((g) => ({
        ...g,
        images: g.images || [],
      }));
      setSavedGenerations(sanitized);
    } catch (e) {
      console.error("Failed to load generations:", e);
      setError("Failed to load generations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);


  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDeleteConfirmed = useCallback(
    async (id, onComplete) => {
      if (!supabase) return;

      try {
        const { error } = await supabase
          .from("generations")
          .delete()
          .eq("id", id);
        if (error) throw error;

        await loadGenerations();
        setToast("Generation deleted successfully");
      } catch (e) {
        console.error("Failed to delete generation:", e);
        setError("Failed to delete generation. Please try again.");
      } finally {
        if (onComplete) onComplete();
      }
    },
    [loadGenerations]
  );

  // Memoize date formatter to avoid recreating it on each render
  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);
  
  const groupedGenerations = useMemo(() => {
    const groups = savedGenerations.reduce((acc, generation) => {
      const date = dateFormatter.format(new Date(generation.created_at));
      if (!acc[date]) acc[date] = [];
      acc[date].push(generation);
      return acc;
    }, {});
    return Object.entries(groups);
  }, [savedGenerations, dateFormatter]);

  const handlePreview = useCallback((generation, src) => {
    setPreview({ generation, src });
  }, []);

  const handleBackClick = useCallback(() => {
    if (backButtonRef.current) {
      gsap.to(backButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    navigate(-1);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="max-w-6xl mx-auto ">
        {/* Header */}
        <div className="w-full mb-6 border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl text-gray-400">
                {isAdmin ? "All Generations" : "Saved Generations"}
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 text-xs bg-purple-900 text-purple-300 rounded-full">
                    Admin
                  </span>
                )}
              </h1>
            </div>
            <button
              ref={backButtonRef}
              onClick={handleBackClick}
              className="px-4 py-2 text-md text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              ← Back
            </button>
          </div>

          {savedGenerations.length > 0 && (() => {
            // Calculate today's generations count once instead of twice
            const today = new Date();
            const todayGenerations = savedGenerations.filter((gen) => {
              const created = new Date(gen.created_at);
              return (
                created.getDate() === today.getDate() &&
                created.getMonth() === today.getMonth() &&
                created.getFullYear() === today.getFullYear()
              );
            }).length;
            
            return (
              <p className="text-sm text-gray-400">
                <i className="ri-arrow-right-circle-fill md:mr-2 mr-1"></i>
                {savedGenerations.length} generation
                {savedGenerations.length !== 1 ? "s" : ""} total
                <i className="ri-arrow-right-long-line md:mx-2 mx-1"></i>
                {todayGenerations}{" "}
                generation
                {todayGenerations !== 1 ? "s" : ""}{" "}
                today
                {isAdmin && (
                  <>
                    <i className="ri-arrow-right-long-line md:mx-2 mx-1"></i>
                    <span className="text-purple-400">Admin View</span>
                  </>
                )}
              </p>
            );
          })()}
        </div>

        {/* Error */}
        {error && <ErrorMessage message={error} onRetry={loadGenerations} />}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <GenerationSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && savedGenerations.length === 0 && (
          <EmptyState />
        )}

        {/* Generations */}
        {!loading && !error && groupedGenerations.length > 0 && (
          <div className="flex flex-col gap-8">
            {groupedGenerations.map(([date, generations]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-gray-300 mb-4">
                  {date}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {generations.map((generation) => (
                    <GenerationCard
                      key={generation.id}
                      generation={generation}
                      onRequestDelete={(id, onComplete) =>
                        setConfirmModal({
                          open: true,
                          generationId: id,
                          onComplete,
                        })
                      }
                      onPreview={handlePreview}
                      showToast={(msg) => setToast(msg)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview modal */}
        {preview && (
          <ImagePreview
            generation={preview.generation}
            src={preview.src}
            onClose={() => setPreview(null)}
          />
        )}

        {/* Toast */}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        {/* Confirmation modal */}
        <ConfirmationModal
          isOpen={confirmModal.open}
          title="Delete Generation?"
          message="This action cannot be undone. Do you really want to delete this generation?"
          onConfirm={() => {
            handleDeleteConfirmed(
              confirmModal.generationId,
              confirmModal.onComplete
            );
            setConfirmModal({
              open: false,
              generationId: null,
              onComplete: null,
            });
          }}
          onCancel={() =>
            setConfirmModal({
              open: false,
              generationId: null,
              onComplete: null,
            })
          }
        />
      </main>
    </div>
  );
});

export default Generations;
