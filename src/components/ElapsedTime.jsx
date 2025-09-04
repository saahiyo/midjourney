import React, { useState, useEffect } from 'react';

function formatMs(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default function ElapsedTime({ startTime, loading }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading || !startTime) return;

    const intervalId = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 250);

    return () => clearInterval(intervalId);
  }, [loading, startTime]);

  if (!loading || !startTime) return null;

  return (
    <p className="text-xs text-neutral-400">
      <i className="ri-timer-line"></i> Elapsed: {formatMs(elapsed)}
    </p>
  );
}
