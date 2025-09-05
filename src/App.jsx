import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import "./index.css";
import ElapsedTime from "./components/ElapsedTime";

const aspectRatios = [
  { label: "Square (default)", value: "--ar 1:1" },
  { label: "Landscape (classic photo)", value: "--ar 3:2" },
  { label: "Landscape (widescreen)", value: "--ar 16:9" },
  { label: "Landscape (ultrawide)", value: "--ar 21:9" },
  { label: "Portrait (classic photo)", value: "--ar 2:3" },
  { label: "Portrait (vertical)", value: "--ar 9:16" },
];

const examples = [
  "cinematic portrait, dramatic rim light, shallow depth of field",
  "lush fantasy landscape, golden hour, volumetric light",
  "sci-fi cityscape, neon lights, rainy night, ultra-detailed",
];

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [displayPrompt, setdisplayPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [error, setError] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0].value);
  const promptRef = useRef(null);

  const abortRef = useRef(null);
  const generationStartRef = useRef(null);

  const [displayAspectr, setDisplayAspectr] = useState(aspectRatios[0].label);

  const [dbEndTime, setDbEndTime] = useState(null);
  const [generationId, setGenerationId] = useState(null); // supabase row id
  const [savedGenerations, setSavedGenerations] = useState([]);

  // helper: label from aspect value
  const getAspectLabel = (value) => {
    const found = aspectRatios.find((r) => r.value === value);
    return found ? found.label : value;
  };

  // fallback fetch created_at if needed (e.g. page reload)
  useEffect(() => {
    if (!loading && generationId && !dbEndTime) {
      const fetchEndTime = async () => {
        const { data, error } = await supabase
          .from("generations")
          .select("created_at")
          .eq("id", generationId)
          .single();

        if (data?.created_at) {
          setDbEndTime(new Date(data.created_at).getTime());
        }
      };

      fetchEndTime();
    }
  }, [loading, generationId, dbEndTime]);

  // dedupe identical image URLs (and normalize objects) so we don't render repeated cards
  const displayImages = Array.isArray(images)
    ? Array.from(
        new Set(
          images
            .map((it) => {
              if (!it) return null;
              if (typeof it === "string") return it;
              // common response shapes: { url } or { src }
              if (typeof it === "object")
                return it.url || it.src || JSON.stringify(it);
              return String(it);
            })
            .filter(Boolean)
        )
      )
    : [];
  // clamp percentage label position so it stays inside the bar
  const pctPos = Math.min(98, Math.max(2, progress));

  // Save generation into Supabase and return inserted row (id, api_id, created_at)
  async function saveGeneration(apiId, promptText, aspect, imgs) {
    if (!supabase) return null;
    try {
      const payload = {
        api_id: apiId || null,
        prompt: promptText,
        aspect_ratio: aspect,
        images: imgs,
      };

      const { data, error } = await supabase
        .from("generations")
        .insert([payload])
        .select("id, api_id, created_at")
        .single();

      if (error) throw error;
      return data; // object with id, api_id, created_at
    } catch (e) {
      console.warn("supabase insert error", e);
      return null;
    }
  }

  async function handleGenerate(overridePrompt) {
    // reset any previous saved gen info for a fresh run
    setGenerationId(null);
    setDbEndTime(null);

    const usedPrompt =
      typeof overridePrompt === "string" ? overridePrompt : prompt;
    setdisplayPrompt(usedPrompt);
    setDisplayAspectr(getAspectLabel(aspectRatio));
    setError(null);
    if (!usedPrompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setImages([]);
    setProgress(5);
    setError(null);
    generationStartRef.current = Date.now();

    const base = import.meta.env.VITE_MJ_API_URL;
    const q = new URLSearchParams({
      prompt: `${usedPrompt.trim()} ${aspectRatio}`,
      usePolling: "true",
    });

    const url = `${base}?${q.toString()}`;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setProgress(12);
      const resp = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
    
      // capture api id if provided
      let apiId = data?.id ?? null;
      // console.log("Generation started, id:", apiId);
      
      // immediate completed response
      if (data.status === "completed" && Array.isArray(data.results)) {
        setImages(data.results);
        setProgress(100);
        // save generation to supabase (best-effort) and capture db id + created_at
        try {
          const saved = await saveGeneration(apiId, usedPrompt, aspectRatio, data.results);
          if (saved?.id) {
            setGenerationId(saved.id);
            if (saved.created_at) setDbEndTime(new Date(saved.created_at).getTime());
          } else {
            // fallback end time if DB save failed
            setDbEndTime(Date.now());
          }
        } catch (e) {
          console.warn("Failed to save generation", e);
          setDbEndTime(Date.now());
        }
        return;
      }

      let pollUrl =
        data.pollingUrl ||
        data.polling_url ||
        (data.id ? `${base}?id=${data.id}` : null);

      if (!pollUrl) {
        throw new Error("No polling url returned by API");
      }

      const start = Date.now();
      // increase timeout to 5 minutes for longer-running generations
      const timeoutMs = 300_000;
      let attempts = 0;
      while (Date.now() - start < timeoutMs) {
        if (controller.signal.aborted) throw new Error("Cancelled");
        attempts += 1;
        setProgress(Math.min(95, 20 + attempts * 10));

        const r = await fetch(pollUrl, {
          method: "GET",
          signal: controller.signal,
        });
        if (!r.ok) throw new Error(`Polling HTTP ${r.status}`);
        const j = await r.json();

        // update apiId if returned on polling responses
        apiId = apiId || j?.id || null;

        if (
          j.status === "completed" &&
          Array.isArray(j.results) &&
          j.results.length > 0
        ) {
          setImages(j.results);
          setProgress(100);
          try {
            const saved = await saveGeneration(apiId, usedPrompt, aspectRatio, j.results);
            if (saved?.id) {
              setGenerationId(saved.id);
              if (saved.created_at) setDbEndTime(new Date(saved.created_at).getTime());
            } else {
              setDbEndTime(Date.now());
            }
          } catch (e) {
            console.warn("Failed to save generation", e);
            setDbEndTime(Date.now());
          }
          return;
        }

        if (j.status === "failed" || j.status === "error") {
          throw new Error(j.message || "Generation failed");
        }

        if (j.pollingUrl) pollUrl = j.pollingUrl;

        await new Promise((res) => setTimeout(res, 1500));
      }

      throw new Error("Generation timed out");
    } catch (e) {
      if (e.name === "AbortError") setError("Generation cancelled");
      else setError("Generation failed — " + (e.message || e));
      setProgress(0);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  const navigate = useNavigate();

  function viewGenerations() {
    // client-side navigation (no full page reload)
    try {
      navigate("/generations");
    } catch (e) {
      console.warn(e);
    }
  }

  async function fetchGenerations() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("generations")
        .select("id, prompt, aspect_ratio, images, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setSavedGenerations(data || []);
    } catch (e) {
      console.warn("supabase fetch error", e);
    }
  }

  function handleDownload(dataUrl, idx) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `mj_${Date.now()}_${idx + 1}.png`;
    a.click();
  }

  function tryExample(example) {
    setPrompt(example);
    // focus the prompt textarea so the user can edit or hit Generate
    try {
      promptRef?.current?.focus?.();
    } catch (e) {}
  }

  function clearAll() {
    if (abortRef.current) abortRef.current.abort();
    setPrompt("");
    setError(null);
    setProgress(0);
    setLoading(false);
    setImages([]);
    setGenerationId(null);
    setDbEndTime(null);
  }

  return (
    <div className="bg-neutral-950 min-h-screen text-white">
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <section className="md:col-span-1 bg-neutral-900 p-4 rounded-lg shadow-lg">
          <div className="flex">
            <i className="ri-arrow-drop-right-fill"></i>
            <label className="text-sm text-neutral-400 mb-3 font-medium">
              Prompt
            </label>
          </div>
          <div className="relative">
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision..."
              rows={6}
              className="w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
            {prompt ? (
              <button
                onClick={clearAll}
                aria-label="Clear prompt"
                className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-white rounded"
              >
                <i className="ri-close-line"></i>
              </button>
            ) : null}
          </div>
          <p className="text-xs text-neutral-400 mt-2 text-right">
            {prompt.length}/500
          </p>

          <div className="mt-6">
            <i className="ri-arrow-drop-right-fill"></i>
            <label className="text-neutral-400 text-xs  font-medium">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-neutral-800 outline-none text-white focus:ring-1 focus:ring-emerald-500 shadow-sm appearance-none relative"
            >
              {aspectRatios.map((ratio, idx) => (
                <option key={idx} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className={`flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg shadow-md transition-transform transform hover:scale-102 flex items-center gap-2`}
            >
              <i className="ri-image-ai-line"></i>
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </section>

        <section className="md:col-span-2 bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg flex flex-col">
          {displayImages.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-400 font-medium">
                Results: {displayImages.length}
              </p>
            </div>
          )}
          {displayImages.length > 0 && (
            <div className=" mb-2 border-t border-neutral-800 py-2">
              <p className="text-sm text-neutral-200 truncate">
                <strong>Prompt:</strong> {displayPrompt}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-xs text-neutral-400">
                  <i className="ri-layout-fill"></i> Aspect Ratio: {displayAspectr}
                </p>
                <ElapsedTime
                  startTime={generationStartRef.current}
                  endTime={dbEndTime || (!loading && Date.now())}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 flex-1 min-h-0">
            {displayImages.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 p-6 flex text-neutral-400 rounded-lg shadow-sm items-center justify-center h-full">
                {loading ? (
                  <div className="w-full relative">
                    <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="h-3 bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="absolute left-0 top-0 w-full h-3 pointer-events-none">
                      <div
                        style={{ left: `${pctPos}%` }}
                        className="absolute -translate-x-1/2 -translate-y-6 text-xs text-neutral-200 bg-neutral-900 px-2 py-1 rounded shadow-sm"
                      >
                        {progress}%
                      </div>
                    </div>
                    <div className="mt-3 text-center text-sm text-neutral-400">
                      <ElapsedTime
                        startTime={generationStartRef.current}
                        loading={loading}
                      />
                      <div className="text-xs text-neutral-500 mt-1">
                        Image will be generated soon — this may take a few
                        moments.
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <i className="ri-error-warning-line text-red-400 text-3xl"></i>
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="mb-3 border-b border-neutral-800 pb-2">
                      <p className="text-sm font-medium text-neutral-400 text-center">
                        No images to display
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-8">
                      {examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => tryExample(ex)}
                          title={ex}
                          className="text-xs truncate max-w-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                        >
                          {" "}
                          <i className="ri-arrow-right-up-long-line mr-2"></i>
                          {ex}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-neutral-400 text-center">
                      Quick tips: try{" "}
                      <span className="text-neutral-200">
                        cinematic portrait, dramatic rim light
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="col-span-1 sm:col-span-2 p-2">
                <div className="flex flex-col gap-4">
                  {/* Large horizontally scrollable gallery of tall thumbnails */}
                  <div className="flex gap-6 overflow-x-auto py-2 -mx-2 px-2 scrollbar-hide">
                    {displayImages.map((src, idx) => (
                      <div
                        key={`${idx}-${src}`}
                        className="flex-none w-44 sm:w-56 md:w-64"
                      >
                        <button
                          onClick={() => setPreviewSrc(src)}
                          className="block w-full h-72 sm:h-80 md:h-96 bg-black rounded-md overflow-hidden shadow-inner"
                          aria-label={`Preview image ${idx + 1}`}
                        >
                          <img
                            src={src}
                            alt={`generated ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Optional secondary row: thumbnails as a compact strip */}
                  <div className="flex gap-3 overflow-x-auto py-1 -mx-2 px-2">
                    {displayImages.map((src, idx) => (
                      <button
                        key={`thumb-${idx}-${src}`}
                        onClick={() => setPreviewSrc(src)}
                        className="flex-none w-20 h-28 sm:w-24 sm:h-32 bg-black rounded-md overflow-hidden shadow-sm"
                      >
                        <img
                          src={src}
                          alt={`thumb ${idx}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      {/* generations are now shown inline; modal removed */}
      {previewSrc && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewSrc(null)}
        >
          <div className="bg-neutral-900 rounded-xl p-3 max-w-[95vw] max-h-[90vh] overflow-auto">
            <img
              src={previewSrc}
              alt="preview"
              className="max-w-full max-h-[80vh] object-contain rounded-md"
            />
            <div className="flex justify-end mt-2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
