import { useState, useEffect } from 'react';
import { sounds } from '../lib/sound';

export const useCountdown = (endsAt, timeLimitSec = 15) => {
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progressPercent, setProgressPercent] = useState(100);

  useEffect(() => {
    if (!endsAt) {
      setTimeLeftMs(0);
      setSecondsLeft(0);
      setProgressPercent(100);
      return;
    }

    const totalDurationMs = timeLimitSec * 1000;

    const updateTimer = () => {
      const remaining = Math.max(0, endsAt - Date.now());
      setTimeLeftMs(remaining);
      const secs = Math.ceil(remaining / 1000);
      setSecondsLeft(secs);

      const percent = Math.min(100, Math.max(0, (remaining / totalDurationMs) * 100));
      setProgressPercent(percent);

      if (secs <= 5 && secs > 0 && remaining % 1000 < 60) {
        sounds.playTick();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);

    return () => clearInterval(interval);
  }, [endsAt, timeLimitSec]);

  return {
    timeLeftMs,
    secondsLeft,
    progressPercent,
    isExpired: timeLeftMs <= 0 && !!endsAt,
  };
};
