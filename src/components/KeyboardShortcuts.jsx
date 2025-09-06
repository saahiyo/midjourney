import React, { useEffect } from 'react';

const KeyboardShortcuts = ({ onGenerate, onClear, onFocusPrompt }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + Enter: Generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onGenerate();
      }

      // Escape: Clear/Cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onClear();
      }

      // Ctrl/Cmd + K: Focus prompt
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onFocusPrompt();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onGenerate, onClear, onFocusPrompt]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
