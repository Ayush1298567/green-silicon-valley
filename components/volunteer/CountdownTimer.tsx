"use client";
import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  title: string;
  description?: string;
  urgent?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  targetDate,
  title,
  description,
  urgent = false
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTimeUnit = (value: number, unit: string) => {
    return (
      <div className="text-center">
        <div className={`text-2xl md:text-3xl font-bold ${
          urgent && !isExpired ? 'text-red-600' : 'text-gray-900'
        }`}>
          {value.toString().padStart(2, '0')}
        </div>
        <div className="text-xs md:text-sm text-gray-600 uppercase tracking-wide">
          {unit}
        </div>
      </div>
    );
  };

  const getUrgencyColor = () => {
    if (isExpired) return 'bg-gray-100 border-gray-200';
    if (urgent) return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getUrgencyIcon = () => {
    if (isExpired) return null;
    if (urgent) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className={`rounded-lg border p-6 ${getUrgencyColor()}`}>
      <div className="flex items-center gap-3 mb-4">
        {getUrgencyIcon()}
        <div>
          <h3 className={`font-semibold ${
            urgent && !isExpired ? 'text-red-900' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          {description && (
            <p className={`text-sm ${
              urgent && !isExpired ? 'text-red-700' : 'text-gray-600'
            }`}>
              {description}
            </p>
          )}
        </div>
      </div>

      {isExpired ? (
        <div className="text-center py-4">
          <div className="text-lg font-semibold text-gray-600 mb-1">
            Time's Up!
          </div>
          <p className="text-sm text-gray-500">
            This deadline has passed
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {formatTimeUnit(timeLeft.days, 'days')}
          {formatTimeUnit(timeLeft.hours, 'hours')}
          {formatTimeUnit(timeLeft.minutes, 'minutes')}
          {formatTimeUnit(timeLeft.seconds, 'seconds')}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Target: {new Date(targetDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}

// Hook for using countdown timers
export function useCountdownTimer(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return { timeLeft, isExpired };
}
