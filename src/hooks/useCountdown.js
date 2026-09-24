import { useState, useEffect } from 'react';

export function useCountdown(targetDate, onExpire) {
  const calculateTimeLeft = () => {
    if (!targetDate) return { totalSeconds: 0, minutes: 0, seconds: 0, isExpired: true };

    const targetTime = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return { totalSeconds: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return { totalSeconds, minutes, seconds, isExpired: false };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default useCountdown;
