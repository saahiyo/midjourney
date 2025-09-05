import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Toast from "../components/Toast";
import ConfirmationModal from "../components/ConfirmationModal";

// Loading skeleton
const GenerationSkeleton = () => (
  <div className="bg-neutral-800 p-2 rounded-xl shadow-md animate-pulse flex flex-col gap-3 border border-transparent min-h-[240px]">
    <div className="px-1">
      <div className="h-4 bg-neutral-700 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-neutral-700 rounded w-2/3"></div>
    </div>
    <div className="grid grid-cols-2 gap-2 flex-grow px-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="aspect-square bg-neutral-700 rounded-lg" />
      ))}
    </div>
    <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-neutral-700 px-1">
      <div className="h-8 bg-neutral-700 rounded w-1/2"></div>
      <div className="h-8 bg-neutral-700 rounded w-24"></div>
    </div>
  </div>
);

// Error message
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <div className="text-red-400 mb-4">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
      >
        Try Again
      </button>
    )}
  </div>
);

// Card
const GenerationCard = ({
  generation,
  onRequestDelete,
  onPreview,
  showToast,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    onRequestDelete(generation.id, () => setIsDeleting(false));
  };

  const handlePolling = () => {
    if (!generation.polling_url) {
      showToast("Polling URL not available for this generation");
      return;
    }
    window.open(generation.polling_url, "_blank");
  };

  return (
    <div className="bg-neutral-800 p-2 rounded-xl shadow-md transition-all duration-200 hover:shadow-emerald-000/50 hover:-translate-y-1 flex flex-col gap-3 border border-transparent hover:border-emerald-700/50">
      <div className="grid grid-cols-2 gap-2 flex-grow">
        {(generation.images || []).slice(0, 4).map((src, i) => (
          <div key={i} className="aspect-square">
            <img
              src={src}
              alt={`Generation ${generation.id} - Image ${i + 1}`}
              className="w-full h-full object-cover rounded-lg cursor-pointer border-1 border-neutral-900 hover:border-emerald-500 transition-all duration-200 hover:scale-105"
              onClick={() => onPreview(generation, src)}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-neutral-700">
        <button
          onClick={handlePolling}
          className="flex-1 px-3 py-1.5 rounded bg-neutral-900 text-xs text-neutral-300 hover:bg-emerald-700 hover:text-white transition-colors duration-200"
        >
          <i className="ri-link mr-2"></i>
          Open Polling
        </button>

        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="px-3 py-1.5 rounded bg-red-900 text-xs text-red-300 hover:bg-red-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ri-delete-bin-line mr-2"></i>
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

// Preview modal
const ImagePreview = ({ generation, src, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

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
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="bg-neutral-900 rounded-lg p-2 shadow-2xl border border-emerald-700/50 max-w-3xl w-full flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-md"
        />
        <div className="text-neutral-300 text-xs bg-neutral-800 p-2 rounded-md">
          <p className="font-mono text-sm text-white mb-2">
            {generation.prompt}
          </p>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>
              {formatDate} at {formatTime}
            </span>
            <span>{generation.aspect_ratio}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Generations() {
  const navigate = useNavigate();
  const [savedGenerations, setSavedGenerations] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

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
      const { data, error } = await supabase
        .from("generations")
        .select(
          "id, api_id, polling_url, prompt, aspect_ratio, images, created_at"
        )
        .order("created_at", { ascending: false });

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
  }, []);

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

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

  const groupedGenerations = useMemo(() => {
    const groups = savedGenerations.reduce((acc, generation) => {
      const date = new Date(generation.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(generation);
      return acc;
    }, {});
    return Object.entries(groups);
  }, [savedGenerations]);

  const handlePreview = (generation, src) => setPreview({ generation, src });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="max-w-6xl mx-auto ">
        {/* Header */}
        {/* Header */}
        <div className="w-full mb-6 border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl text-neutral-400">Saved Generations</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-md text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
            >
              ← Back
            </button>
          </div>

          {savedGenerations.length > 0 && (
            <p className="text-sm text-neutral-400">
              <i className="ri-arrow-right-circle-fill mr-2"></i>
              {savedGenerations.length} generation
              {savedGenerations.length !== 1 ? "s" : ""} total
              <i className="ri-arrow-right-long-line mx-2"></i>
              {
                savedGenerations.filter((gen) => {
                  const created = new Date(gen.created_at);
                  const today = new Date();
                  return (
                    created.getDate() === today.getDate() &&
                    created.getMonth() === today.getMonth() &&
                    created.getFullYear() === today.getFullYear()
                  );
                }).length
              }{" "}
              generation
              {savedGenerations.filter((gen) => {
                const created = new Date(gen.created_at);
                const today = new Date();
                return (
                  created.getDate() === today.getDate() &&
                  created.getMonth() === today.getMonth() &&
                  created.getFullYear() === today.getFullYear()
                );
              }).length !== 1
                ? "s"
                : ""}{" "}
              today
            </p>
          )}
        </div>

        {/* Error */}
        {error && <ErrorMessage message={error} onRetry={loadGenerations} />}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <GenerationSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && savedGenerations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-neutral-500 text-lg mb-2">
              No generations found
            </div>
            <p className="text-neutral-400 text-sm">
              Your saved AI generations will appear here
            </p>
          </div>
        )}

        {/* Generations */}
        {!loading && !error && groupedGenerations.length > 0 && (
          <div className="flex flex-col gap-8">
            {groupedGenerations.map(([date, generations]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-neutral-300 mb-4">
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
}
