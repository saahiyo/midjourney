import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { API_CONFIG } from '../utils/constants';
import { handleApiError, logError } from '../utils/errorHandler';

/**
 * useImageGeneration
 * A robust hook to request image generation from an external API, poll for completion,
 * save results to Supabase, and provide cancellation + progress updates.
 *
 * Improvements in this refactor:
 * - Mounted guard to avoid setState after unmount
 * - Proper AbortController management and cleanup
 * - Centralized error handling via handleApiError + logError
 * - Polling loop that respects timeouts and aborts, with a stable sleep helper
 * - Optimistic and safe state updates only when mounted
 * - Clearer progress milestones and consistent returned state/actions
 */
export const useImageGeneration = () => {
  // public state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [pollingUrl, setPollingUrl] = useState('');
  const [generationId, setGenerationId] = useState(null);
  const [dbEndTime, setDbEndTime] = useState(null);

  // refs
  const abortRef = useRef(null); // AbortController for current operation
  const generationStartRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // abort any in-flight request on unmount
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch (e) { /* noop */ }
        abortRef.current = null;
      }
    };
  }, []);

  // Helper: safe setState only if mounted
  const safeSet = (setter) => {
    return (...args) => {
      if (mountedRef.current) setter(...args);
    };
  };

  const safeSetLoading = safeSet(setLoading);
  const safeSetProgress = safeSet(setProgress);
  const safeSetImages = safeSet(setImages);
  const safeSetError = safeSet(setError);
  const safeSetPollingUrl = safeSet(setPollingUrl);
  const safeSetGenerationId = safeSet(setGenerationId);
  const safeSetDbEndTime = safeSet(setDbEndTime);

  // Save generation record to Supabase (returns saved record or null)
  const saveGeneration = useCallback(async (apiId, pollUrl, promptText, aspect, imgs) => {
    if (!supabase) return null;

    try {
      const payload = {
        api_id: apiId || null,
        polling_url: pollUrl || null,
        prompt: promptText,
        aspect_ratio: aspect,
        images: imgs || [],
      };

      const { data, error: supabaseError } = await supabase
        .from('generations')
        .insert([payload])
        .select('id, api_id, polling_url, created_at')
        .single();

      if (supabaseError) throw supabaseError;
      return data || null;
    } catch (e) {
      logError(e, 'Supabase insert (saveGeneration)');
      return null;
    }
  }, []);

  // small sleep helper that listens for abort
  const sleep = (ms, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const t = setTimeout(() => {
      signal && signal.removeEventListener && signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal && signal.addEventListener && signal.addEventListener('abort', onAbort);
  });

  // Poll until completion or timeout. Returns the final data object on success.
  const pollForCompletion = useCallback(async (initialPollUrl, apiId, prompt, aspectRatio) => {
    if (!initialPollUrl) throw new Error('No polling URL provided');

    const controller = abortRef.current ?? new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const startTime = Date.now();
    let currentUrl = initialPollUrl;
    let attempts = 0;

    while (Date.now() - startTime < (API_CONFIG.TIMEOUT || 5 * 60 * 1000)) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      attempts += 1;
      safeSetProgress(Math.min(95, 20 + attempts * 8));

      try {
        const res = await fetch(currentUrl, { method: 'GET', signal });
        if (!res.ok) throw new Error(`Polling HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();

        // update apiId and polling url if returned
        apiId = apiId || data?.id || null;
        if (data?.pollingUrl || data?.polling_url) {
          currentUrl = data.pollingUrl || data.polling_url;
          safeSetPollingUrl(currentUrl);
        }

        // Completed
        if (data?.status === 'completed' && Array.isArray(data.results) && data.results.length > 0) {
          safeSetImages(data.results);
          safeSetProgress(100);

          const saved = await saveGeneration(apiId, currentUrl, prompt, aspectRatio, data.results);
          if (saved?.id) {
            safeSetGenerationId(saved.id);
            if (saved.created_at) safeSetDbEndTime(new Date(saved.created_at).getTime());
            else safeSetDbEndTime(Date.now());
          } else {
            safeSetDbEndTime(Date.now());
          }

          return data;
        }

        // Failure reported by API
        if (data?.status === 'failed' || data?.status === 'error') {
          const msg = data?.message || 'Generation failed';
          throw new Error(msg);
        }

        // allow pollUrl updates in response
        if (data?.pollingUrl) currentUrl = data.pollingUrl;
        if (data?.polling_url) currentUrl = data.polling_url;

        // wait before next poll (respects abort)
        await sleep(API_CONFIG.POLLING_INTERVAL || 1500, signal);
      } catch (err) {
        if (err.name === 'AbortError' || err.code === 'AbortError') throw err;
        // Log and keep polling for transient network errors
        logError(err, 'pollForCompletion');
        // small backoff before retrying
        await sleep(API_CONFIG.POLLING_INTERVAL || 1500, signal).catch(() => { throw new DOMException('Aborted', 'AbortError'); });
      }
    }

    throw new Error('Generation timed out');
  }, [saveGeneration]);

  // Start a new generation flow
  const generateImages = useCallback(async (prompt, aspectRatio) => {
    // reset state
    safeSetError(null);
    safeSetImages([]);
    safeSetGenerationId(null);
    safeSetDbEndTime(null);
    safeSetPollingUrl('');

    safeSetLoading(true);
    generationStartRef.current = Date.now();
    safeSetProgress(5);

    const base = import.meta.env.VITE_MJ_API_URL;
    if (!base) {
      safeSetError('Missing generation API URL');
      safeSetLoading(false);
      return;
    }

    // Build query parameters
    const query = new URLSearchParams({ prompt: `${prompt.trim()} ${aspectRatio}`, usePolling: 'true' });
    const url = `${base}?${query.toString()}`;

    // setup AbortController for this request (replaces any existing)
    try {
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch (e) { /* noop */ }
        abortRef.current = null;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const signal = controller.signal;

      safeSetProgress(12);

      const response = await fetch(url, { method: 'GET', signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();

      // determine pollingUrl / apiId
      let apiId = data?.id ?? null;
      const pollUrl = data?.pollingUrl || data?.polling_url || (data?.id ? `${base}?id=${data.id}` : null);
      safeSetPollingUrl(pollUrl || '');

      // immediate completed response
      if (data?.status === 'completed' && Array.isArray(data.results)) {
        safeSetImages(data.results);
        safeSetProgress(100);

        const saved = await saveGeneration(apiId, pollUrl, prompt, aspectRatio, data.results);
        if (saved?.id) {
          safeSetGenerationId(saved.id);
          if (saved.created_at) safeSetDbEndTime(new Date(saved.created_at).getTime());
          else safeSetDbEndTime(Date.now());
        } else {
          safeSetDbEndTime(Date.now());
        }

        return data;
      }

      // else poll until completed
      await pollForCompletion(pollUrl || `${base}?id=${data?.id}`, apiId, prompt, aspectRatio);

    } catch (e) {
      const info = handleApiError(e);
      safeSetError(info.message || 'Generation failed');
      safeSetProgress(0);
      logError(e, 'generateImages');
      // if aborted, leave loading false in finalizer
      if (e.name === 'AbortError') {
        // cancelled by user
      }
    } finally {
      // finalize only if mounted
      safeSetLoading(false);
      // keep abortRef for possible reuse; clear it if aborted
      if (abortRef.current?.signal?.aborted) {
        abortRef.current = null;
      }
    }
  }, [pollForCompletion, saveGeneration]);

  const cancelGeneration = useCallback(() => {
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (e) { /* noop */ }
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
    safeSetPollingUrl('');
  }, [cancelGeneration]);

  return {
    // state
    loading,
    progress,
    images,
    error,
    pollingUrl,
    generationId,
    dbEndTime,
    generationStartTime: generationStartRef.current,

    // actions
    generateImages,
    cancelGeneration,
    resetGeneration,
    setError: safeSetError,
  };
};
