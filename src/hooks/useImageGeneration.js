import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { API_CONFIG } from "../utils/constants";
import { handleApiError, logError } from "../utils/errorHandler";

export const useImageGeneration = () => {
  // public state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [pollingUrl, setPollingUrl] = useState("");
  const [generationId, setGenerationId] = useState(null);
  const [dbEndTime, setDbEndTime] = useState(null);

  // refs
  const abortRef = useRef(null);
  const generationStartRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {}
        abortRef.current = null;
      }
    };
  }, []);

  // safe setState wrapper
  const safeSet = (setter) => (...args) => {
    if (mountedRef.current) setter(...args);
  };

  const safeSetLoading = safeSet(setLoading);
  const safeSetProgress = safeSet(setProgress);
  const safeSetImages = safeSet(setImages);
  const safeSetError = safeSet(setError);
  const safeSetPollingUrl = safeSet(setPollingUrl);
  const safeSetGenerationId = safeSet(setGenerationId);
  const safeSetDbEndTime = safeSet(setDbEndTime);

  // Save generation record
  const saveGeneration = useCallback(async (apiId, pollUrl, promptText, aspect, imgs) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error: supabaseError } = await supabase
        .from("generations")
        .insert([{
          api_id: apiId || null,
          polling_url: pollUrl || null,
          prompt: promptText,
          aspect_ratio: aspect,
          images: imgs || [],
          user_id: user?.id,
        }])
        .select("id, created_at")
        .single();

      if (supabaseError) throw supabaseError;
      return data || null;
    } catch (e) {
      logError(e, "Supabase insert (saveGeneration)");
      return null;
    }
  }, []);

  // Sleep helper
  const sleep = (ms, signal) =>
    new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
      const t = setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

  // Poll until completion
  const pollForCompletion = useCallback(async (pollUrl, apiId, prompt, aspectRatio) => {
    if (!pollUrl) throw new Error("No polling URL provided");

    const controller = abortRef.current || new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const start = Date.now();
    let attempts = 0;

    while (Date.now() - start < (API_CONFIG.TIMEOUT || 5 * 60 * 1000)) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");

      attempts++;
      safeSetProgress(Math.min(95, 20 + attempts * 8));

      try {
        const res = await fetch(pollUrl, { method: "GET", signal });
        if (!res.ok) throw new Error(`Polling HTTP ${res.status}`);

        const data = await res.json();

        if (data?.status === "completed" && Array.isArray(data.results)) {
          safeSetImages(data.results);
          safeSetProgress(100);

          const saved = await saveGeneration(apiId, pollUrl, prompt, aspectRatio, data.results);
          if (saved?.id) {
            safeSetGenerationId(saved.id);
            safeSetDbEndTime(new Date(saved.created_at).getTime());
          } else {
            safeSetDbEndTime(Date.now());
          }
          return data;
        }

        if (data?.status === "failed" || data?.status === "error") {
          throw new Error(data?.message || "Generation failed");
        }

        await sleep(API_CONFIG.POLLING_INTERVAL || 1500, signal);
      } catch (err) {
        if (err.name === "AbortError") throw err;
        logError(err, "pollForCompletion");
        await sleep(API_CONFIG.POLLING_INTERVAL || 1500, signal);
      }
    }

    throw new Error("Generation timed out");
  }, [saveGeneration]);

  // Start generation
  const generateImages = useCallback(async (prompt, aspectRatio) => {
    safeSetError(null);
    safeSetImages([]);
    safeSetGenerationId(null);
    safeSetDbEndTime(null);
    safeSetPollingUrl("");

    safeSetLoading(true);
    generationStartRef.current = Date.now();
    safeSetProgress(5);

    try {
      const response = await fetch(`${supabase.functionsUrl}/mj-gen-images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const errInfo = data?.error?.message || data?.error?.code || `HTTP ${response.status}`;
        throw new Error(errInfo);
      }

      safeSetPollingUrl(data.pollingUrl || "");
      safeSetProgress(15);

      await pollForCompletion(data.pollingUrl, data.id, prompt, aspectRatio);
    } catch (e) {
      const info = handleApiError(e);
      safeSetError(info.message || "Generation failed");
      safeSetProgress(0);
      logError(e, "generateImages");
    } finally {
      safeSetLoading(false);
    }
  }, [pollForCompletion]);

  const cancelGeneration = useCallback(() => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
      abortRef.current = null;
    }
    safeSetLoading(false);
    safeSetProgress(0);
  }, []);

  const resetGeneration = useCallback(() => {
    cancelGeneration();
    safeSetError(null);
    safeSetProgress(0);
    safeSetLoading(false);
    safeSetImages([]);
    safeSetGenerationId(null);
    safeSetDbEndTime(null);
    safeSetPollingUrl("");
  }, [cancelGeneration]);

  return {
    loading,
    progress,
    images,
    error,
    pollingUrl,
    generationId,
    dbEndTime,
    generationStartTime: generationStartRef.current,
    generateImages,
    cancelGeneration,
    resetGeneration,
    setError: safeSetError,
  };
};
