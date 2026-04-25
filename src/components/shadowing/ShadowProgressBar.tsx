import React from 'react';

interface ShadowProgressBarProps {
  step: number;
  totalSteps?: number;
}

const ShadowProgressBar: React.FC<ShadowProgressBarProps> = ({ step, totalSteps = 3 }) => {
  const progress = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Шаг {step} из {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className="h-2 rounded-full bg-black transition-all duration-500 dark:bg-white"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ShadowProgressBar;

