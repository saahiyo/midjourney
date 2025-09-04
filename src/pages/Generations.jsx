import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Loading skeleton component
const GenerationSkeleton = () => (
  <div className="bg-neutral-800 p-4 rounded-xl animate-pulse">
    <div className="h-4 bg-neutral-700 rounded mb-2"></div>
    <div className="h-3 bg-neutral-700 rounded w-2/3 mb-2"></div>
    <div className="flex gap-2 mb-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 h-20 bg-neutral-700 rounded-lg"></div>
      ))}
    </div>
    <div className="flex justify-between">
      <div className="h-6 bg-neutral-700 rounded w-16"></div>
      <div className="h-6 bg-neutral-700 rounded w-12"></div>
    </div>
  </div>
);

// Error boundary component
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

// Individual generation card component
const GenerationCard = ({ generation, onDelete, onPreview }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this generation?")) return;
    
    setIsDeleting(true);
    try {
      await onDelete(generation.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#gen-${generation.id}`
      );
      // Could add a toast notification here
    } catch (error) {
      console.warn("Failed to copy to clipboard:", error);
    }
  };

  const formatDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(generation.created_at));
  }, [generation.created_at]);

  return (
    <div className="bg-neutral-800 p-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-emerald-900/50 hover:-translate-y-1 flex flex-col gap-3 border border-transparent hover:border-emerald-700/50">
      <div>
        <h3 
          className="text-base text-neutral-100 font-semibold line-clamp-2 mb-1 leading-tight"
          title={generation.prompt}
        >
          {generation.prompt}
        </h3>
        <div className="text-xs text-neutral-400">
          {generation.aspect_ratio} • {formatDate}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 flex-grow">
        {(generation.images || []).slice(0, 4).map((src, i) => (
          <div key={i} className="aspect-square">
            <img
              src={src}
              alt={`Generation ${generation.id} - Image ${i + 1}`}
              className="w-full h-full object-cover rounded-lg cursor-pointer border-2 border-neutral-900 hover:border-emerald-500 transition-all duration-200 hover:scale-105"
              onClick={() => onPreview(src)}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-neutral-700">
        <button
          onClick={handleCopyLink}
          className="flex-1 px-3 py-1.5 rounded bg-neutral-900 text-xs text-neutral-300 hover:bg-emerald-700 hover:text-white transition-colors duration-200"
          aria-label="Copy link to generation"
        >
          Copy Link
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1.5 rounded bg-red-900 text-xs text-red-300 hover:bg-red-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Delete generation"
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

// Image preview modal
const ImagePreview = ({ src, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="bg-neutral-900 rounded-xl p-4 shadow-2xl border border-emerald-700/50 max-w-4xl max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors duration-200 self-center"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function Generations() {
  const navigate = useNavigate();
  const [savedGenerations, setSavedGenerations] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadPage = useCallback(async (p = 0) => {
    if (!supabase) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const from = p * pageSize;
      const to = from + pageSize - 1;
      
      // Fetch data and count in parallel
      const [{ data, error: dataError }, { count, error: countError }] = await Promise.all([
        supabase
          .from("generations")
          .select("id, prompt, aspect_ratio, images, created_at")
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase
          .from("generations")
          .select("*", { count: 'exact', head: true })
      ]);

      if (dataError) throw dataError;
      if (countError) throw countError;

      setSavedGenerations(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      console.error("Failed to load generations:", e);
      setError("Failed to load generations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  const handleDelete = useCallback(async (id) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from("generations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Reload current page
      await loadPage(page);
    } catch (e) {
      console.error("Failed to delete generation:", e);
      setError("Failed to delete generation. Please try again.");
    }
  }, [loadPage, page]);

  const handlePrevPage = useCallback(() => {
    if (page > 0) {
      const newPage = page - 1;
      setPage(newPage);
      loadPage(newPage);
    }
  }, [page, loadPage]);

  const handleNextPage = useCallback(() => {
    const newPage = page + 1;
    setPage(newPage);
    loadPage(newPage);
  }, [page, loadPage]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Saved Generations</h1>
            {totalCount > 0 && (
              <p className="text-sm text-neutral-400">
                {totalCount} generation{totalCount !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          >
            ← Back
          </button>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => loadPage(page)} 
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(pageSize)].map((_, i) => (
              <GenerationSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && savedGenerations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-neutral-500 text-lg mb-2">No generations found</div>
            <p className="text-neutral-400 text-sm">
              Your saved AI generations will appear here
            </p>
          </div>
        )}

        {/* Generations Grid */}
        {!loading && !error && savedGenerations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedGenerations.map((generation) => (
              <GenerationCard
                key={generation.id}
                generation={generation}
                onDelete={handleDelete}
                onPreview={setPreviewSrc}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalCount > pageSize && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Page {page + 1} of {totalPages} 
              <span className="ml-2">
                ({page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-emerald-700 hover:text-white transition-colors duration-200 text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-emerald-700 hover:text-white transition-colors duration-200 text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {previewSrc && (
          <ImagePreview 
            src={previewSrc} 
            onClose={() => setPreviewSrc(null)} 
          />
        )}
      </main>
    </div>
  );
}