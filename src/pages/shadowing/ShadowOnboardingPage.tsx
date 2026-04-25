import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ShadowProgressBar from '../../components/shadowing/ShadowProgressBar';
import { SHADOW_CATEGORIES } from '../../components/shadowing/catalog';
import { saveShadowOnboarding } from '../../components/shadowing/storage';
import { ShadowOnboardingData } from '../../components/shadowing/types';

const ShadowOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [profession, setProfession] = useState<string>('');
  const [classGrade, setClassGrade] = useState<'8' | '9' | '10' | '11' | ''>('');
  const [achievements, setAchievements] = useState('');

  const selectedCategory = useMemo(
    () => SHADOW_CATEGORIES.find((category) => category.id === categoryId),
    [categoryId]
  );

  const canMoveNext = useMemo(() => {
    if (step === 1) return Boolean(categoryId);
    if (step === 2) return Boolean(profession);
    if (step === 3) return Boolean(classGrade);
    return false;
  }, [step, categoryId, profession, classGrade]);

  const goNext = () => {
    if (!canMoveNext) return;
    if (step < 3) {
      setStep((prev) => prev + 1);
      return;
    }

    if (!selectedCategory || !classGrade) return;

    const payload: ShadowOnboardingData = {
      categoryId: selectedCategory.id,
      categoryTitle: selectedCategory.title,
      profession,
      classGrade,
      achievements: achievements.trim() || undefined,
    };

    saveShadowOnboarding(payload);
    navigate('/shadow/simulate');
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black transition-colors dark:bg-black dark:text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Shadowing AI</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Проживи один рабочий день выбранной профессии и получи персональный карьерный разбор.
          </p>
          <ShadowProgressBar step={step} totalSteps={3} />
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {SHADOW_CATEGORIES.map((category) => {
              const isActive = category.id === categoryId;
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    setCategoryId(category.id);
                    setProfession('');
                  }}
                  className={[
                    'rounded-2xl border p-6 text-left transition-all',
                    isActive
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-gray-200 hover:-translate-y-1 hover:border-gray-900 dark:border-gray-800 dark:hover:border-gray-200',
                  ].join(' ')}
                >
                  <h3 className="mb-2 text-xl font-semibold">{category.title}</h3>
                  <p className={isActive ? 'text-white/90 dark:text-black/80' : 'text-gray-500 dark:text-gray-400'}>
                    {category.subtitle}
                  </p>
                </button>
              );
            })}
          </motion.div>
        )}

        {step === 2 && selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              Выбери профессию в категории: <span className="underline">{selectedCategory.title}</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {selectedCategory.professions.map((item) => {
                const selected = item === profession;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setProfession(item)}
                    className={[
                      'rounded-xl border px-4 py-5 font-medium transition-all',
                      selected
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-gray-200 hover:border-gray-900 dark:border-gray-800 dark:hover:border-gray-200',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-gray-200 p-6 dark:border-gray-800"
          >
            <h2 className="text-xl font-semibold">Ещё немного о тебе</h2>
            <div>
              <label className="mb-2 block text-sm text-gray-500 dark:text-gray-400">Класс</label>
              <div className="grid grid-cols-4 gap-2">
                {(['8', '9', '10', '11'] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setClassGrade(grade)}
                    className={[
                      'rounded-lg border py-2 text-sm font-medium',
                      classGrade === grade
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-gray-200 dark:border-gray-700',
                    ].join(' ')}
                  >
                    {grade} класс
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
                Достижения (необязательно)
              </label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={5}
                placeholder="Олимпиады, секции, проекты, курсы, волонтёрство..."
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-black dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              />
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
          >
            Назад
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canMoveNext}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {step === 3 ? 'Начать симуляцию' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShadowOnboardingPage;

