import React, { useState, useEffect } from 'react';

function formatMs(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function ElapsedTime({ startTime, endTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    // If we already have an endTime, freeze the value once
    if (endTime) {
      setElapsed(endTime - startTime);
      return;
    }

    // Otherwise keep ticking until an endTime appears
    const intervalId = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 250);

    return () => clearInterval(intervalId);
  }, [startTime, endTime]);

  if (!startTime) return null;

  return (
    <p className="text-xs text-neutral-400">
      <i className="ri-timer-line"></i> Elapsed: {formatMs(elapsed)}
    </p>
  );
}
