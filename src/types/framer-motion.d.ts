declare module 'framer-motion' {
  import React from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    variants?: any;
    viewport?: {
      once?: boolean;
      amount?: number | 'some' | 'all';
      margin?: string;
    };
    transition?: {
      duration?: number;
      delay?: number;
      ease?: string;
      repeat?: number | boolean;
      repeatType?: 'loop' | 'reverse' | 'mirror';
      type?: string;
      stiffness?: number;
      damping?: number;
    };
    style?: React.CSSProperties & {
      y?: number;
      x?: number;
      scale?: number;
      rotate?: number;
    };
    className?: string;
    children?: React.ReactNode;
    ref?: React.RefObject<any>;
  }

  export const motion: {
    div: React.ForwardRefExoticComponent<MotionProps & React.HTMLAttributes<HTMLDivElement>>;
    span: React.ForwardRefExoticComponent<MotionProps & React.HTMLAttributes<HTMLSpanElement>>;
    button: React.ForwardRefExoticComponent<MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>>;
    [key: string]: React.ForwardRefExoticComponent<MotionProps & any>;
  };

  export function useScroll(): {
    scrollY: any;
    scrollX: any;
    scrollYProgress: any;
    scrollXProgress: any;
  };

  export function useTransform(
    value: any,
    input: [number, number],
    output: [number, number]
  ): any;

  export const AnimatePresence: React.ComponentType<{
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
    presenceAffectsLayout?: boolean;
  }>;
} 