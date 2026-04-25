import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type CategoryKey = 'help' | 'build' | 'persuade';

const categories: Record<CategoryKey, { title: string; professions: string[] }> = {
  help: {
    title: 'Спасаю людей',
    professions: ['Врач', 'Психолог', 'Социальный работник'],
  },
  build: {
    title: 'Строю системы',
    professions: ['Программист', 'Инженер', 'Архитектор'],
  },
  persuade: {
    title: 'Убеждаю людей',
    professions: ['Юрист', 'Маркетолог', 'Предприниматель'],
  },
};

const ShadowOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [profession, setProfession] = useState('');
  const [achievements, setAchievements] = useState('');

  const progress = (step / 3) * 100;
  const selectedProfessions = useMemo(
    () => (category ? categories[category].professions : []),
    [category]
  );

  const next = () => {
    if (step === 1 && !category) return;
    if (step === 2 && !profession) return;
    if (step === 3) {
      localStorage.setItem(
        'shadowData',
        JSON.stringify({
          category: category ? categories[category].title : '',
          profession,
          achievements: achievements.trim(),
        })
      );
      navigate('/simulate');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prev = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="min-h-screen bg-white px-4 py-8 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-black dark:text-white">Shadowing AI</h1>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Пройди 3 шага и начни симуляцию профессии.
        </p>
        <div className="mb-8 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-2 rounded-full bg-black transition-all dark:bg-white" style={{ width: `${progress}%` }} />
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-3">
            {(Object.keys(categories) as CategoryKey[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setCategory(key);
                  setProfession('');
                }}
                className={`rounded-2xl border p-6 text-left transition ${
                  category === key
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-gray-200 text-black hover:border-black dark:border-gray-700 dark:text-white dark:hover:border-white'
                }`}
              >
                <h2 className="text-xl font-semibold">{categories[key].title}</h2>
                <p className="mt-2 text-sm opacity-80">{categories[key].professions.join(' / ')}</p>
              </button>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-3">
            {selectedProfessions.map((item) => (
              <button
                key={item}
                onClick={() => setProfession(item)}
                className={`rounded-xl border px-4 py-5 text-left font-medium ${
                  profession === item
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-gray-200 text-black dark:border-gray-700 dark:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
            <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">
              Достижения (необязательно)
            </label>
            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={7}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="Олимпиады, курсы, кружки, волонтерство..."
            />
          </motion.div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 1}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm text-black disabled:opacity-50 dark:border-gray-700 dark:text-white"
          >
            Назад
          </button>
          <button
            onClick={next}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            {step === 3 ? 'Начать' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShadowOnboarding;

