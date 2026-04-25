import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCopy, FiTrendingUp } from 'react-icons/fi';
import { readShadowOnboarding, readShadowResult } from '../../components/shadowing/storage';

const ShadowResultPage: React.FC = () => {
  const navigate = useNavigate();
  const result = readShadowResult();
  const onboarding = readShadowOnboarding();

  const fitScore = useMemo(() => Math.max(0, Math.min(100, result?.fit_score || 0)), [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-white px-4 py-12 text-black dark:bg-black dark:text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 p-8 text-center dark:border-gray-800">
          <h1 className="mb-4 text-2xl font-bold">Нет данных результата</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Сначала пройди симуляцию профессии, затем вернись на эту страницу.
          </p>
          <button
            type="button"
            onClick={() => navigate('/shadow')}
            className="rounded-full bg-black px-6 py-3 text-white dark:bg-white dark:text-black"
          >
            Перейти к Shadowing AI
          </button>
        </div>
      </div>
    );
  }

  const copyPortfolio = async () => {
    await navigator.clipboard.writeText(result.portfolio_text);
  };

  const circleAngle = (fitScore / 100) * 360;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-black dark:bg-black dark:text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Shadowing AI / Финальный разбор</p>
          <h1 className="mt-2 text-3xl font-bold">
            Профессия: {onboarding?.profession || 'Выбранная профессия'}
          </h1>
        </header>

        <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950 md:grid-cols-[1fr_240px]">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Твои сильные стороны</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {result.strengths.slice(0, 3).map((item, index) => (
                <div key={index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <FiCheckCircle className="mb-2 text-xl" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{result.fit_description}</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative h-40 w-40">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#111827 ${circleAngle}deg, #e5e7eb ${circleAngle}deg)`,
                }}
              />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white dark:bg-black">
                <div className="text-center">
                  <div className="text-3xl font-bold">{fitScore}%</div>
                  <div className="text-xs text-gray-500">совпадение</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950">
          <h2 className="mb-4 text-2xl font-semibold">Финансовый маршрут</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['Джун', result.salary_junior],
              ['Мид', result.salary_mid],
              ['Сеньор', result.salary_senior],
            ].map(([level, salary]) => (
              <div key={level} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wider text-gray-500">{level}</p>
                <p className="mt-2 text-lg font-semibold">{salary}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Топ вузы</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {result.top_universities.map((uni, index) => (
                  <li key={index}>• {uni}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Гранты МОН РК</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {result.grants.map((grant, index) => (
                  <li key={index}>• {grant}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950">
          <h2 className="mb-4 text-2xl font-semibold">Твоё портфолио</h2>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.portfolio_text}</p>
          </div>
          <button
            type="button"
            onClick={copyPortfolio}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
          >
            <FiCopy />
            Скопировать
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Этот текст будет автоматически добавлен в твой профиль при регистрации.
          </p>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-gray-950"
        >
          <h2 className="mb-4 text-2xl font-semibold">Следующий шаг</h2>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            <FiTrendingUp />
            Создать профиль и найти проекты
          </button>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Уже есть аккаунт? <a className="underline" href="/login">Войти</a>
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default ShadowResultPage;

