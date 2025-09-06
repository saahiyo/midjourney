import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { supabase } from "./lib/supabaseClient";
import "./index.css";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { usePromptForm } from "./hooks/usePromptForm";
import { useImagePreview } from "./hooks/useImagePreview";
import PromptForm from "./components/PromptForm";
import ImageGallery from "./components/ImageGallery";
import ImagePreviewModal from "./components/ImagePreviewModal";
import ExamplePrompts from "./components/ExamplePrompts";
import ErrorBoundary from "./components/ErrorBoundary";
import ElapsedTime from "./components/ElapsedTime";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import { aspectRatios } from "./constants/aspectRatios";
import { trackGeneration, trackError, trackUserAction } from "./utils/analytics";
import { logEnvironmentStatus } from "./utils/envValidation";

const App = () => {
  const navigate = useNavigate();
  const appRef = useRef(null);
  
  // Custom hooks
  const {
    loading,
    progress,
    images,
    error,
    pollingUrl,
    generationId,
    dbEndTime,
    generationStartTime,
    generateImages,
    resetGeneration,
    setError,
  } = useImageGeneration();

  const {
    prompt,
    displayPrompt,
    aspectRatio,
    displayAspectRatio,
    promptRef,
    isPromptValid,
    promptLength,
    maxPromptLength,
    updatePrompt,
    updateAspectRatio,
    setDisplayPrompt,
    clearPrompt,
    focusPrompt,
  } = usePromptForm();

  const {
    previewSrc,
    openPreview,
    closePreview,
  } = useImagePreview();

  // Validate environment on app start
  useEffect(() => {
    logEnvironmentStatus();
  }, []);

  // Animate app on mount
  useEffect(() => {
    if (appRef.current) {
      gsap.fromTo(appRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, []);

  // Fallback fetch created_at if needed (e.g. page reload)
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

  // Event handlers
  const handleGenerate = async () => {
    if (!isPromptValid) {
      setError("Please enter a valid prompt.");
      trackError('validation', 'Invalid prompt');
      return;
    }

    trackUserAction('generate_clicked');
    setDisplayPrompt(prompt);
    
    const startTime = Date.now();
    try {
      await generateImages(prompt, aspectRatio);
      const duration = Date.now() - startTime;
      trackGeneration(prompt, aspectRatio, duration, true);
    } catch (error) {
      const duration = Date.now() - startTime;
      trackGeneration(prompt, aspectRatio, duration, false);
      trackError('generation_failed', error.message);
    }
  };

  const handleTryExample = (example) => {
    trackUserAction('example_clicked', example);
    updatePrompt(example);
    focusPrompt();
  };

  const handleClearAll = () => {
    trackUserAction('clear_clicked');
    clearPrompt();
    resetGeneration();
  };

  return (
    <ErrorBoundary>
    <div ref={appRef} className="bg-neutral-950 min-h-screen text-white">
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <PromptForm
            prompt={prompt}
            promptRef={promptRef}
            aspectRatio={aspectRatio}
            displayAspectRatio={displayAspectRatio}
            isPromptValid={isPromptValid}
            promptLength={promptLength}
            maxPromptLength={maxPromptLength}
            loading={loading}
            onPromptChange={updatePrompt}
            onAspectRatioChange={updateAspectRatio}
            onGenerate={handleGenerate}
            onClear={handleClearAll}
          />

        <section className="md:col-span-2 bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 flex-1 min-h-0">
              {images.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 p-6 flex text-neutral-400 rounded-lg shadow-sm items-center justify-center h-full">
                {loading ? (
                  <div className="w-full relative">
                    <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden shadow-inner">
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
                          style={{ left: `${Math.min(98, Math.max(2, progress))}%` }}
                        className="absolute -translate-x-1/2 -translate-y-6 text-xs text-neutral-200 bg-neutral-900 px-2 py-1 rounded shadow-sm"
                      >
                        {progress}%
                      </div>
                    </div>
                    <div className="mt-3 text-center text-sm text-neutral-400">
                      <ElapsedTime
                          startTime={generationStartTime}
                        loading={loading}
                      />
                      <div className="text-xs text-neutral-500 mt-1">
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
                      <p className="text-sm font-medium text-neutral-400 text-center">
                        No images to display
                      </p>
                    </div>
                      <ExamplePrompts onTryExample={handleTryExample} />
                    <div className="mt-4 text-xs text-neutral-400 text-center">
                        Quick tips: try{' '}
                      <span className="text-neutral-200">
                        cinematic portrait, dramatic rim light
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
                <ImageGallery
                  images={images}
                  displayPrompt={displayPrompt}
                  displayAspectRatio={displayAspectRatio}
                  loading={loading}
                  progress={progress}
                  error={error}
                  generationStartTime={generationStartTime}
                  dbEndTime={dbEndTime}
                  onImageClick={openPreview}
                />
            )}
          </div>
        </section>
      </main>

        {/* Debug info */}
        <div className="fixed bottom-4 left-4 text-xs text-neutral-500 bg-neutral-900/80 p-2 rounded">
          <div>Polling URL: <span className="text-neutral-300 truncate block max-w-xs">{pollingUrl || "—"}</span></div>
          <div>DB id: <span className="text-neutral-300">{generationId ?? "—"}</span></div>
        </div>

        <ImagePreviewModal src={previewSrc} onClose={closePreview} />
        
        {/* Keyboard shortcuts */}
        <KeyboardShortcuts
          onGenerate={handleGenerate}
          onClear={handleClearAll}
          onFocusPrompt={focusPrompt}
        />
        
      </div>
    </ErrorBoundary>
  );
};

export default App;