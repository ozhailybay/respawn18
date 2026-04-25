declare module 'react-chartjs-2' {
  import React from 'react';
  
  export interface ChartData {
    labels?: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
    total?: number;
  }

  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: {
      y?: {
        beginAtZero?: boolean;
        grid?: {
          color?: string;
        };
        ticks?: {
          color?: string;
        };
      };
      x?: {
        grid?: {
          color?: string;
          display?: boolean;
        };
        ticks?: {
          color?: string;
        };
      };
    };
    plugins?: {
      legend?: {
        position?: 'top' | 'bottom';
        display?: boolean;
        labels?: {
          color?: string;
          usePointStyle?: boolean;
          pointStyle?: string;
          padding?: number;
        };
      };
      tooltip?: {
        backgroundColor?: string;
        titleColor?: string;
        bodyColor?: string;
        cornerRadius?: number;
        padding?: number;
      };
    };
    animation?: {
      duration?: number;
      tension?: {
        duration?: number;
        easing?: string;
        from?: number;
        to?: number;
        loop?: boolean;
      };
      animateRotate?: boolean;
      animateScale?: boolean;
    };
    cutout?: string;
  }

  export const Line: React.FC<{ data: ChartData; options?: ChartOptions }>;
  export const Bar: React.FC<{ data: ChartData; options?: ChartOptions }>;
  export const Doughnut: React.FC<{ data: ChartData; options?: ChartOptions }>;
} 