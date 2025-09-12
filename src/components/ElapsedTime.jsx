import React, { useState, useEffect, useMemo } from "react";

function formatMs(ms) {
  if (ms == null || ms < 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function ElapsedTime({ startTime, endTime, intervalMs = 1000 }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    if (endTime) {
      setElapsed(Math.max(0, endTime - startTime));
      return;
    }

    const tick = () => {
      setElapsed(Math.max(0, Date.now() - startTime));
    };

    tick(); // initialize immediately
    const id = setInterval(tick, intervalMs);

    return () => clearInterval(id);
  }, [startTime, endTime, intervalMs]);

  const formatted = useMemo(() => formatMs(elapsed), [elapsed]);

  if (!startTime) return null;

  return (
    <p className="text-xs text-gray-400" aria-live="polite">
      <i className="ri-timer-line"></i> Elapsed: {formatted}
    </p>
  );
}
