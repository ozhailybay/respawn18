import React, { useEffect, useState, useRef, useCallback } from 'react';

interface CountUpProps {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  decimal?: string;
  separator?: string;
  prefix?: string;
  suffix?: string;
  useEasing?: boolean;
  easingFn?: (t: number, b: number, c: number, d: number) => number;
  enableScrollSpy?: boolean;
  scrollSpyOnce?: boolean;
  scrollSpyDelay?: number;
}

// Оптимизированная функция easeOutExpo
const easeOutExpo = (t: number, b: number, c: number, d: number): number => {
  return c * (-Math.pow(2, -10 * t / d) + 1) + b;
};

const CountUp: React.FC<CountUpProps> = ({
  start = 0,
  end,
  duration = 2,
  delay = 0,
  decimals = 0,
  decimal = '.',
  separator = '',
  prefix = '',
  suffix = '',
  useEasing = true,
  easingFn = easeOutExpo,
  enableScrollSpy = false,
  scrollSpyOnce = true,
  scrollSpyDelay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Форматирование числа с учетом десятичных знаков и разделителей
  const formatNumber = useCallback((value: number): string => {
    const roundedValue = Number(value.toFixed(decimals));
    const parts = roundedValue.toString().split('.');
    
    let integerPart = parts[0];
    if (separator) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    
    let formattedValue = prefix + integerPart;
    
    if (decimals > 0) {
      let decimalPart = parts[1] || '0'.repeat(decimals);
      decimalPart = decimalPart.padEnd(decimals, '0');
      formattedValue += decimal + decimalPart;
    }
    
    formattedValue += suffix;
    return formattedValue;
  }, [decimals, decimal, separator, prefix, suffix]);

  // Оптимизированная функция анимации
  const startAnimation = useCallback(() => {
    if (hasAnimated && scrollSpyOnce) return;
    
    const step = (timestamp: number) => {
      if (!isMountedRef.current) return;
      
      if (startTimestampRef.current === null) {
        startTimestampRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimestampRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      if (progress < 1) {
        let currentValue;
        if (useEasing) {
          currentValue = easingFn(progress, start, end - start, 1);
        } else {
          currentValue = start + (end - start) * progress;
        }
        
        setDisplayValue(currentValue);
        animationRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
        setHasAnimated(true);
      }
    };
    
    // Если есть задержка, используем setTimeout
    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          startTimestampRef.current = null;
          animationRef.current = requestAnimationFrame(step);
        }
      }, delay * 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      startTimestampRef.current = null;
      animationRef.current = requestAnimationFrame(step);
    }
  }, [start, end, duration, delay, useEasing, easingFn, hasAnimated, scrollSpyOnce]);

  // Обработчик видимости для ScrollSpy
  useEffect(() => {
    isMountedRef.current = true;
    
    // Очистка при размонтировании
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Настройка IntersectionObserver для ScrollSpy
  useEffect(() => {
    if (!enableScrollSpy || !elementRef.current) {
      if (!enableScrollSpy) {
        startAnimation();
      }
      return;
    }

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Добавляем небольшую задержку для ScrollSpy
        setTimeout(() => {
          if (isMountedRef.current) {
            startAnimation();
          }
        }, scrollSpyDelay * 1000);
        
        // Если анимация должна запускаться только один раз
        if (scrollSpyOnce && observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: '0px',
    });
    
    observerRef.current.observe(elementRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [startAnimation, enableScrollSpy, scrollSpyOnce, scrollSpyDelay]);

  // Мемоизированное форматированное значение
  const formattedValue = formatNumber(displayValue);

  return (
    <div ref={elementRef} aria-live="polite">
      {formattedValue}
    </div>
  );
};

export default React.memo(CountUp); 