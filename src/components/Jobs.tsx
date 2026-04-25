import React from 'react';
import { FiAward, FiBookOpen, FiDollarSign } from 'react-icons/fi';

const universities = [
  { name: 'Nazarbayev University', city: 'Астана', admission: 'NUET или SAT + IELTS (через NUFYP/UG)' },
  { name: 'КазНУ им. аль-Фараби', city: 'Алматы', admission: 'ЕНТ (профильные предметы)' },
  { name: 'КБТУ', city: 'Алматы', admission: 'ЕНТ / внутренний конкурс + английский' },
  { name: 'ENU им. Л.Н. Гумилева', city: 'Астана', admission: 'ЕНТ (профильные предметы)' },
  { name: 'Satbayev University', city: 'Алматы', admission: 'ЕНТ (технические направления)' },
  { name: 'AITU', city: 'Астана', admission: 'ЕНТ + конкурс на IT-направления' },
];

const grants = [
  'Государственные образовательные гранты МНВО РК (бакалавриат)',
  'Целевые гранты акиматов для региональных абитуриентов',
  'Гранты по STEM-направлениям в приоритетных отраслях',
  'Вузовские ректорские и академические гранты',
];

const Jobs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white px-4 py-8 dark:bg-black md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-950">
          <h1 className="text-3xl font-bold text-black dark:text-white">Университеты и Гранты</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Список вузов Казахстана с реальными форматами поступления (где нужно — NUET/SAT + IELTS) и актуальные варианты грантов.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <FiBookOpen className="text-lg text-black dark:text-white" />
            <h2 className="text-xl font-semibold text-black dark:text-white">Университеты Казахстана</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {universities.map((uni) => (
              <div key={uni.name} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <p className="font-semibold text-black dark:text-white">{uni.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{uni.city}</p>
                <p className="mt-2 inline-flex rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">
                  {uni.admission}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <FiAward className="text-lg text-black dark:text-white" />
            <h2 className="text-xl font-semibold text-black dark:text-white">Гранты МОН РК</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {grants.map((grant) => (
              <li key={grant} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
                • {grant}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-3 flex items-center gap-2">
            <FiDollarSign className="text-lg text-black dark:text-white" />
            <h2 className="text-xl font-semibold text-black dark:text-white">Рекомендация</h2>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Сначала пройди симуляцию профессии в Shadowing AI, затем выбери профильный вуз и грант под свою траекторию.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Jobs;

