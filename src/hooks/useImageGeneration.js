import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { API_CONFIG } from '../utils/constants';
import { handleApiError, logError } from '../utils/errorHandler';

export const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [pollingUrl, setPollingUrl] = useState('');
  const [generationId, setGenerationId] = useState(null);
  const [dbEndTime, setDbEndTime] = useState(null);
  
  const abortRef = useRef(null);
  const generationStartRef = useRef(null);

  const saveGeneration = useCallback(async (apiId, pollUrl, promptText, aspect, imgs) => {
    if (!supabase) return null;
    
    try {
      const payload = {
        api_id: apiId || null,
        polling_url: pollUrl || null,
        prompt: promptText,
        aspect_ratio: aspect,
        images: imgs,
      };

      const { data, error } = await supabase
        .from('generations')
        .insert([payload])
        .select('id, api_id, polling_url, created_at')
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      logError(e, 'Supabase insert');
      return null;
    }
  }, []);

  const generateImages = useCallback(async (prompt, aspectRatio) => {
    // Reset state for new generation
    setGenerationId(null);
    setDbEndTime(null);
    setPollingUrl('');
    setError(null);
    setImages([]);
    setLoading(true);
    setProgress(5);
    generationStartRef.current = Date.now();

    const base = import.meta.env.VITE_MJ_API_URL;
    const queryParams = new URLSearchParams({
      prompt: `${prompt.trim()} ${aspectRatio}`,
      usePolling: 'true',
    });

    const url = `${base}?${queryParams.toString()}`;
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setProgress(12);
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let apiId = data?.id ?? null;
      let pollUrl = data?.pollingUrl || data?.polling_url || 
                   (data?.id ? `${base}?id=${data.id}` : null);
      
      setPollingUrl(pollUrl || '');

      // Handle immediate completion
      if (data.status === 'completed' && Array.isArray(data.results)) {
        setImages(data.results);
        setProgress(100);
        
        try {
          const saved = await saveGeneration(apiId, pollUrl, prompt, aspectRatio, data.results);
          if (saved?.id) {
            setGenerationId(saved.id);
            if (saved.created_at) {
              setDbEndTime(new Date(saved.created_at).getTime());
            }
          } else {
            setDbEndTime(Date.now());
          }
        } catch (e) {
          console.warn('Failed to save generation:', e);
          setDbEndTime(Date.now());
        }
        return;
      }

      // Handle polling for incomplete requests
      await pollForCompletion(pollUrl || `${base}?id=${data.id}`, apiId, prompt, aspectRatio);
      
    } catch (e) {
      const errorInfo = handleApiError(e);
      setError(errorInfo.message);
      setProgress(0);
      logError(e, 'Image generation');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [saveGeneration]);

  const pollForCompletion = useCallback(async (pollUrl, apiId, prompt, aspectRatio) => {
    if (!pollUrl) {
      throw new Error('No polling URL available');
    }

    const start = Date.now();
    let attempts = 0;
    let currentPollUrl = pollUrl;

    while (Date.now() - start < API_CONFIG.TIMEOUT) {
      if (abortRef.current?.signal.aborted) {
        throw new Error('Cancelled');
      }

      attempts += 1;
      setProgress(Math.min(95, 20 + attempts * 10));

      try {
        const response = await fetch(currentPollUrl, {
          method: 'GET',
          signal: abortRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`Polling HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Update API ID and polling URL if provided
        apiId = apiId || data?.id || null;
        if (data?.pollingUrl || data?.polling_url) {
          currentPollUrl = data.pollingUrl || data.polling_url;
          setPollingUrl(currentPollUrl);
        }

        // Check for completion
        if (data.status === 'completed' && Array.isArray(data.results) && data.results.length > 0) {
          setImages(data.results);
          setProgress(100);
          
          try {
            const saved = await saveGeneration(apiId, currentPollUrl, prompt, aspectRatio, data.results);
            if (saved?.id) {
              setGenerationId(saved.id);
              if (saved.created_at) {
                setDbEndTime(new Date(saved.created_at).getTime());
              }
            } else {
              setDbEndTime(Date.now());
            }
          } catch (e) {
            console.warn('Failed to save generation:', e);
            setDbEndTime(Date.now());
          }
          return;
        }

        // Check for failure
        if (data.status === 'failed' || data.status === 'error') {
          throw new Error(data.message || 'Generation failed');
        }

        // Update polling URL if changed
        if (data.pollingUrl) currentPollUrl = data.pollingUrl;
        if (data.polling_url) currentPollUrl = data.polling_url;

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.POLLING_INTERVAL));
        
      } catch (e) {
        if (e.name === 'AbortError') {
          throw e;
        }
        logError(e, 'Polling');
        // Continue polling on network errors
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.POLLING_INTERVAL));
      }
    }

    throw new Error('Generation timed out after 5 minutes');
  }, [saveGeneration]);

  const cancelGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const resetGeneration = useCallback(() => {
    cancelGeneration();
    setError(null);
    setProgress(0);
    setLoading(false);
    setImages([]);
    setGenerationId(null);
    setDbEndTime(null);
    setPollingUrl('');
  }, [cancelGeneration]);

  return {
    // State
    loading,
    progress,
    images,
    error,
    pollingUrl,
    generationId,
    dbEndTime,
    generationStartTime: generationStartRef.current,
    
    // Actions
    generateImages,
    cancelGeneration,
    resetGeneration,
    setError,
  };
};
