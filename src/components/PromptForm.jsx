import React, { memo, useRef, useEffect, useState } from 'react';
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
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const dropdownListRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isDropdownOpen) {
          handleDropdownClose();
        }
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleAspectRatioChange = (selectedValue) => {
    const selectedRatio = aspectRatios.find(ratio => ratio.value === selectedValue);
    onAspectRatioChange(selectedValue, selectedRatio?.label || selectedValue);
    handleDropdownClose();
  };

  const handleDropdownToggle = () => {
    if (isDropdownOpen) {
      handleDropdownClose();
    } else {
      handleDropdownOpen();
    }
  };

  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
    if (dropdownListRef.current) {
      gsap.fromTo(dropdownListRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  };

  const handleDropdownClose = () => {
    if (dropdownListRef.current) {
      gsap.to(dropdownListRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setIsDropdownOpen(false)
      });
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleDropdownButtonClick = () => {
    if (dropdownButtonRef.current) {
      gsap.to(dropdownButtonRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    handleDropdownToggle();
  };

  const handleKeyDown = (event) => {
    if (!isDropdownOpen) return;

    switch (event.key) {
      case 'Escape':
        handleDropdownClose();
        dropdownButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Focus next option or first if none focused
        const nextOption = event.target.nextElementSibling || 
          dropdownListRef.current?.querySelector('button');
        nextOption?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Focus previous option or last if none focused
        const prevOption = event.target.previousElementSibling || 
          dropdownListRef.current?.querySelector('button:last-child');
        prevOption?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (event.target.getAttribute('role') === 'option') {
          event.target.click();
        }
        break;
    }
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
    <section ref={formRef} className="md:col-span-1 bg-neutral-900 p-4 rounded-lg shadow-lg relative z-10">
      <div className="flex">
        <i className="ri-arrow-drop-right-fill" aria-hidden="true"></i>
        <label className="text-sm text-gray-400 mb-3 font-medium">
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
            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white rounded"
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        )}
      </div>
      
      <p id="prompt-help" className="text-xs text-gray-400 mt-2 text-right">
        {promptLength}/{maxPromptLength}
      </p>

      <div className="mt-6">
        <i className="ri-arrow-drop-right-fill" aria-hidden="true"></i>
        <label className="text-gray-400 text-xs font-medium">
          Aspect Ratio
        </label>
        
        {/* Custom Dropdown */}
        <div ref={dropdownRef} className="relative mt-2">
          <button
            ref={dropdownButtonRef}
            onClick={handleDropdownButtonClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleDropdownButtonClick();
              }
            }}
            className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 hover:border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm flex items-center justify-between transition-colors"
            aria-label="Select aspect ratio"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="text-left">
              {aspectRatios.find(ratio => ratio.value === aspectRatio)?.label || aspectRatio}
            </span>
            <i 
              className={`ri-arrow-down-s-line transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
              aria-hidden="true"
            ></i>
          </button>

          {/* Dropdown List */}
          {isDropdownOpen && (
            <div
              ref={dropdownListRef}
              className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 overflow-y-auto "
              role="listbox"
              aria-label="Aspect ratio options"
              onKeyDown={handleKeyDown}
              style={{ maxWidth: 'none' }}
            >
              {aspectRatios.map((ratio, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAspectRatioChange(ratio.value)}
                  className={`w-full px-4 py-3 text-left text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none transition-colors ${
                    ratio.value === aspectRatio 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : ''
                  } ${idx === 0 ? 'rounded-t-lg' : ''} ${
                    idx === aspectRatios.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                  role="option"
                  aria-selected={ratio.value === aspectRatio}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-xs">{ratio.label}</span>
                    {ratio.value === aspectRatio && (
                      <i className="ri-check-line text-emerald-300" aria-hidden="true"></i>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          ref={generateButtonRef}
          onClick={handleGenerateClick}
          disabled={loading || !isPromptValid}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700  disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2"
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
