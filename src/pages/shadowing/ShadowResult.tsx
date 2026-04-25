import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiCopy, FiTrendingUp } from 'react-icons/fi';

interface ShadowResultData {
  strengths: string[];
  fit_score: number;
  fit_description: string;
  key_insights?: string[];
  growth_plan?: string[];
  best_work_style?: string;
  portfolio_text: string;
  salary_junior: string;
  salary_mid: string;
  salary_senior: string;
  universities: string[];
  grants: string[];
}

const defaultResult: ShadowResultData = {
  strengths: ['Аналитическое мышление', 'Ответственность', 'Адаптивность'],
  fit_score: 75,
  fit_description: 'Есть хороший потенциал по выбранному направлению. Попробуй еще раз симуляцию для более точного результата.',
  key_insights: [
    'Ты уверенно действуешь в ситуациях с ограниченным временем.',
    'У тебя выраженный практический стиль мышления.',
    'Ты склонен(на) брать ответственность за итог решения.',
    'Тебе подходят задачи с измеримым результатом.',
  ],
  growth_plan: [
    'Собери 2-3 профильных кейса в портфолио.',
    'Прокачай профильные инструменты и базовую аналитику.',
    'Выбери образовательную траекторию и дедлайны по этапам.',
  ],
  best_work_style:
    'Лучше всего подойдет динамичная проектная среда с понятными метриками результата и регулярной обратной связью.',
  portfolio_text:
    'Я развиваюсь в выбранной профессии, умею быстро анализировать ситуацию и принимать решения в условиях ограниченного времени.',
  salary_junior: '250 000 - 450 000 тг',
  salary_mid: '500 000 - 900 000 тг',
  salary_senior: '1 000 000+ тг',
  universities: ['Nazarbayev University — NUET / SAT + IELTS', 'КБТУ — ЕНТ + внутренний конкурс', 'Satbayev University — ЕНТ профильные предметы'],
  grants: ['Государственный образовательный грант МНВО РК', 'Целевой грант акимата'],
};

const normalizeList = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
    .filter(Boolean);
  return normalized.length ? normalized : fallback;
};

const normalizeResult = (raw: ShadowResultData | null): ShadowResultData | null => {
  if (!raw) return null;
  return {
    strengths: normalizeList(raw.strengths, defaultResult.strengths),
    fit_score: Number.isFinite(Number(raw.fit_score)) ? Number(raw.fit_score) : defaultResult.fit_score,
    fit_description:
      typeof raw.fit_description === 'string' && raw.fit_description.trim()
        ? raw.fit_description
        : defaultResult.fit_description,
    key_insights: normalizeList(raw.key_insights, defaultResult.key_insights || []),
    growth_plan: normalizeList(raw.growth_plan, defaultResult.growth_plan || []),
    best_work_style:
      typeof raw.best_work_style === 'string' && raw.best_work_style.trim()
        ? raw.best_work_style
        : defaultResult.best_work_style,
    portfolio_text:
      typeof raw.portfolio_text === 'string' && raw.portfolio_text.trim()
        ? raw.portfolio_text
        : defaultResult.portfolio_text,
    salary_junior:
      typeof raw.salary_junior === 'string' && raw.salary_junior.trim()
        ? raw.salary_junior
        : defaultResult.salary_junior,
    salary_mid:
      typeof raw.salary_mid === 'string' && raw.salary_mid.trim() ? raw.salary_mid : defaultResult.salary_mid,
    salary_senior:
      typeof raw.salary_senior === 'string' && raw.salary_senior.trim()
        ? raw.salary_senior
        : defaultResult.salary_senior,
    universities: normalizeList(raw.universities, defaultResult.universities),
    grants: normalizeList(raw.grants, defaultResult.grants),
  };
};

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
};

const ShadowResult: React.FC = () => {
  const navigate = useNavigate();

  const shadowData = useMemo(
    () => safeParse<{ profession?: string }>(localStorage.getItem('shadowData')),
    []
  );
  const result = useMemo(
    () => normalizeResult(safeParse<ShadowResultData>(localStorage.getItem('shadowResult'))),
    []
  );

  if (!result) {
    return (
      <div className="min-h-screen bg-white p-8 dark:bg-black">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 p-8 text-center dark:border-gray-700">
          <h1 className="text-2xl font-bold text-black dark:text-white">Нет результата симуляции</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Пройди симуляцию заново, чтобы получить персональный разбор.
          </p>
          <button
            onClick={() => navigate('/shadow')}
            className="mt-5 rounded-full bg-black px-6 py-3 text-white dark:bg-white dark:text-black"
          >
            Перейти к симуляции
          </button>
        </div>
      </div>
    );
  }

  const fitScore = Math.max(0, Math.min(100, Number(result.fit_score || 0)));
  const angle = fitScore * 3.6;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-black md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Твой карьерный разбор: {shadowData?.profession || 'Профессия'}
          </h1>
        </section>

        <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950 md:grid-cols-[1fr_240px]">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">Твои сильные стороны</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {result.strengths.slice(0, 3).map((item, index) => (
                <div key={index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <FiCheckCircle className="mb-2 text-lg text-black dark:text-white" />
                  <p className="text-sm text-black dark:text-white">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{result.fit_description}</p>

            <div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">Ключевые инсайты</h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {(result.key_insights || []).slice(0, 6).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative h-40 w-40">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#111827 ${angle}deg, #e5e7eb ${angle}deg)`,
                }}
              />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white dark:bg-black">
                <div className="text-center">
                  <p className="text-3xl font-bold text-black dark:text-white">{fitScore}%</p>
                  <p className="text-xs text-gray-500">совпадение</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950">
          <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">Финансовый маршрут</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-xs text-gray-500">Джун</p>
              <p className="mt-2 text-lg font-semibold text-black dark:text-white">{result.salary_junior}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-xs text-gray-500">Мид</p>
              <p className="mt-2 text-lg font-semibold text-black dark:text-white">{result.salary_mid}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-xs text-gray-500">Сеньор</p>
              <p className="mt-2 text-lg font-semibold text-black dark:text-white">{result.salary_senior}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-black dark:text-white">Университеты</h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {result.universities.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black dark:text-white">Гранты</h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {result.grants.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-950">
          <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">Твоё портфолио</h2>
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Позиционирование кандидата</p>
            <p className="whitespace-pre-wrap text-sm text-black dark:text-white">{result.portfolio_text}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">Оптимальный формат работы</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.best_work_style}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">План роста</h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {(result.growth_plan || []).slice(0, 5).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(result.portfolio_text || '')}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-black dark:border-gray-700 dark:text-white"
          >
            <FiCopy />
            Скопировать
          </button>
        </section>

        <section className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-gray-950">
          <button
            onClick={() => navigate('/resume-generator')}
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            <FiTrendingUp />
            Перейти в резюме и сохранить результат
          </button>
        </section>
      </div>
    </div>
  );
};

export default ShadowResult;

