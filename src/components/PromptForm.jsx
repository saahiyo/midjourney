import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { aspectRatios } from '../constants/aspectRatios';

const PromptForm = memo(({
  prompt,
  promptRef,
  aspectRatio,
  displayAspectRatio,
  isPromptValid,
  promptLength,
  maxPromptLength,
  loading,
  onPromptChange,
  onAspectRatioChange,
  onGenerate,
  onClear,
}) => {
  const formRef = useRef(null);
  const generateButtonRef = useRef(null);
  const clearButtonRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const handleAspectRatioChange = (e) => {
    const selectedRatio = aspectRatios.find(ratio => ratio.value === e.target.value);
    onAspectRatioChange(e.target.value, selectedRatio?.label || e.target.value);
  };

  const handleGenerateClick = () => {
    if (generateButtonRef.current) {
      gsap.to(generateButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    onGenerate();
  };

  const handleClearClick = () => {
    if (clearButtonRef.current) {
      gsap.to(clearButtonRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    onClear();
  };

  return (
    <section ref={formRef} className="md:col-span-1 bg-neutral-900 p-4 rounded-lg shadow-lg">
      <div className="flex">
        <i className="ri-arrow-drop-right-fill" aria-hidden="true"></i>
        <label className="text-sm text-neutral-400 mb-3 font-medium">
          Prompt
        </label>
      </div>
      
      <div className="relative">
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe your vision..."
          rows={6}
          maxLength={maxPromptLength}
          className="w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          aria-label="Image generation prompt"
          aria-describedby="prompt-help"
        />
        {prompt && (
          <button
            ref={clearButtonRef}
            onClick={handleClearClick}
            aria-label="Clear prompt"
            className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-white rounded"
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        )}
      </div>
      
      <p id="prompt-help" className="text-xs text-neutral-400 mt-2 text-right">
        {promptLength}/{maxPromptLength}
      </p>

      <div className="mt-6">
        <i className="ri-arrow-drop-right-fill" aria-hidden="true"></i>
        <label className="text-neutral-400 text-xs font-medium">
          Aspect Ratio
        </label>
        <select
          value={aspectRatio}
          onChange={handleAspectRatioChange}
          className="w-full mt-2 p-3 rounded-lg bg-neutral-800 outline-none text-white focus:ring-1 focus:ring-emerald-500 shadow-sm appearance-none relative"
          aria-label="Select aspect ratio"
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
          ref={generateButtonRef}
          onClick={handleGenerateClick}
          disabled={loading || !isPromptValid}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2"
          aria-label={loading ? "Generating images..." : "Generate images"}
        >
          <i className="ri-image-ai-line" aria-hidden="true"></i>
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </section>
  );
});

PromptForm.displayName = 'PromptForm';

export default PromptForm;
