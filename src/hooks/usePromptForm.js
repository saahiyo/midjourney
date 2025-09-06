import { useState, useRef, useCallback } from 'react';
import { validatePrompt, sanitizeInput } from '../utils/validation';
import { UI_CONFIG } from '../utils/constants';

export const usePromptForm = () => {
  const [prompt, setPrompt] = useState('');
  const [displayPrompt, setDisplayPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('--ar 1:1');
  const [displayAspectRatio, setDisplayAspectRatio] = useState('Square (default)');
  
  const promptRef = useRef(null);

  const sanitizePrompt = useCallback((input) => {
    return sanitizeInput(input);
  }, []);

  const updatePrompt = useCallback((newPrompt) => {
    // Only limit length, don't sanitize on every keystroke
    const limited = newPrompt.length > UI_CONFIG.MAX_PROMPT_LENGTH 
      ? newPrompt.substring(0, UI_CONFIG.MAX_PROMPT_LENGTH)
      : newPrompt;
    setPrompt(limited);
  }, []);

  const updateAspectRatio = useCallback((newAspectRatio, label) => {
    setAspectRatio(newAspectRatio);
    setDisplayAspectRatio(label);
  }, []);

  const setDisplayPromptValue = useCallback((prompt) => {
    // Only sanitize when setting display prompt (for generation)
    setDisplayPrompt(sanitizePrompt(prompt));
  }, [sanitizePrompt]);

  const clearPrompt = useCallback(() => {
    setPrompt('');
    setDisplayPrompt('');
  }, []);

  const focusPrompt = useCallback(() => {
    try {
      promptRef.current?.focus?.();
    } catch (e) {
      console.warn('Failed to focus prompt input:', e);
    }
  }, []);

  const promptValidation = validatePrompt(prompt);
  const isPromptValid = promptValidation.isValid;

  return {
    // State
    prompt,
    displayPrompt,
    aspectRatio,
    displayAspectRatio,
    promptRef,
    isPromptValid,
    promptLength: prompt.length,
    maxPromptLength: UI_CONFIG.MAX_PROMPT_LENGTH,
    promptValidation,
    
    // Actions
    updatePrompt,
    updateAspectRatio,
    setDisplayPrompt: setDisplayPromptValue,
    clearPrompt,
    focusPrompt,
  };
};
