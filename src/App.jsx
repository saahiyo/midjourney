import React, { useState, useRef } from "react";

const aspectRatios = [
  { label: "Square (default)", value: "--ar 1:1" },
  { label: "Landscape (classic photo)", value: "--ar 3:2" },
  { label: "Landscape (widescreen)", value: "--ar 16:9" },
  { label: "Landscape (ultrawide)", value: "--ar 21:9" },
  { label: "Portrait (classic photo)", value: "--ar 2:3" },
  { label: "Portrait (vertical)", value: "--ar 9:16" },
];

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0].value);
  const promptRef = useRef(null);

  const abortRef = useRef(null);
  // dedupe identical image URLs so we don't render repeated cards
  const displayImages = Array.isArray(images)
    ? Array.from(new Set(images))
    : [];
  // clamp percentage label position so it stays inside the bar
  const pctPos = Math.min(98, Math.max(2, progress));
  // example prompts to show in empty state
  const examples = [
    'cinematic portrait, dramatic rim light, shallow depth of field',
    'lush fantasy landscape, golden hour, volumetric light',
    'sci-fi cityscape, neon lights, rainy night, ultra-detailed',
  ];

  async function handleGenerate(overridePrompt) {
    // if called from an onClick handler React will pass the event as the first arg.
    // only treat overridePrompt as an override when it's a string; otherwise use the `prompt` state.
    const usedPrompt = typeof overridePrompt === 'string' ? overridePrompt : prompt;
    setError(null);
    if (!usedPrompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setImages([]);
    setProgress(5);
    setError(null);

    const base = "https://api.oculux.xyz/api/mj-proxy-pub";
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

      if (data.status === "completed" && Array.isArray(data.results)) {
        setImages(data.results);
        setProgress(100);
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

        if (
          j.status === "completed" &&
          Array.isArray(j.results) &&
          j.results.length > 0
        ) {
          setImages(j.results);
          setProgress(100);
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
    setImages([]);
    setError(null);
    setProgress(0);
    setLoading(false);
  }

  return (
    <div className="bg-neutral-950 min-h-screen p-8 text-white ">
      <header className="max-w-6xl border-b border-neutral-800 mb-8 mx-auto tracking-wide pb-2">
        <div className="flex items-center gap-3">
          <i class="ri-bard-fill text-2xl md:text-3xl text-emerald-500"></i>
          <h1 className="md:text-4xl text-3xl text-emerald-500 font-semibold tracking-wider">
            MidJourney
          </h1>
        </div>
        <p className="text-sm md:text-base text-neutral-400 mt-2 tracking-tight">
          Generate stunning images with a sleek and modern interface.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-1 bg-neutral-900 p-4 rounded-lg shadow-lg">
          <div className="flex">
            <i class="ri-arrow-drop-right-fill"></i>
            <label className="block text-sm text-neutral-300 mb-3 font-medium">
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
            <label className="text-xs text-neutral-400 font-medium">
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
              onClick={handleGenerate}
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
            <div className="mt-2 bg-neutral-800 p-3 rounded-md">
              <p className="text-sm text-neutral-200 truncate">
                <strong>Prompt:</strong> {prompt}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Aspect Ratio: {aspectRatio}
              </p>
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
                  </div>
                ) : error ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <i class="ri-error-warning-line text-red-400 text-3xl"></i>
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="mb-3 border-b border-neutral-800 pb-2">
                      <p className="text-sm font-medium text-neutral-400 text-center">No images to display</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-8">
                      {examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => tryExample(ex)}
                          title={ex}
                          className="text-xs truncate max-w-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                        > <i class="ri-arrow-right-up-long-line mr-2"></i>
                          {ex}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-neutral-400 text-center">
                      Quick tips: try <span className="text-neutral-200">cinematic portrait, dramatic rim light</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              displayImages.map((src, idx) => (
                <div
                  key={`${idx}-${src}`}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="w-full h-64 bg-black flex items-center justify-center">
                    {loading ? (
                      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-emerald-500"></div>
                    ) : (
                      <img
                        src={src}
                        alt={`generated ${idx + 1}`}
                        className="object-cover w-full h-64"
                      />
                    )}
                  </div>
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-neutral-300 truncate">
                        Variant {idx + 1}
                      </p>
                      {/* prompt and aspect ratio shown once above the results */}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownload(src, idx)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                      >
                        <i className="ri-download-line"></i>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
