import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiChevronDown, FiCompass, FiCpu, FiTarget, FiTrendingUp } from 'react-icons/fi';

interface QAItem {
  question: string;
  answer: string;
}

const qaItems: QAItem[] = [
  {
    question: 'Что такое Respawn простыми словами?',
    answer:
      'Respawn — это карьерная платформа для школьников и студентов Казахстана, где можно пройти симуляцию профессии, получить маршрут развития и сразу упаковать результаты в портфолио.',
  },
  {
    question: 'Чем ваш подход отличается от обычных профтестов?',
    answer:
      'Вместо теста на абстрактные вопросы ты проходишь мини-сценарий рабочего дня. AI анализирует решения и показывает не только “что подходит”, но и как действовать дальше.',
  },
  {
    question: 'Нужно ли регистрироваться, чтобы попробовать?',
    answer:
      'Нет. Основной сценарий Shadowing AI запускается сразу, без регистрации. Это сделано специально, чтобы снизить порог входа и дать быстрый первый результат.',
  },
  {
    question: 'Насколько результаты полезны в реальной жизни?',
    answer:
      'После симуляции ты получаешь прикладной результат: сильные стороны, fit-score, ориентир по обучению/грантам и готовый текст о себе для резюме или профиля.',
  },
  {
    question: 'Для кого в первую очередь этот проект?',
    answer:
      'Для школьников 8–11 классов, абитуриентов, студентов первых курсов и тех, кто еще не определился с направлением. Также полезен родителям и кураторам.',
  },
  {
    question: 'Какая цель проекта на ближайший период?',
    answer:
      'Сделать профориентацию понятной и современной: меньше сложных терминов, больше ясных шагов и реальных траекторий поступления и карьерного роста.',
  },
];

const valueCards = [
  {
    title: 'Осознанный выбор',
    text: 'Помогаем понять, какая профессия реально откликается через практическую симуляцию, а не теорию.',
    icon: FiCompass,
  },
  {
    title: 'Прозрачный маршрут',
    text: 'Показываем путь от первого интереса до учебы и карьеры: навыки, вузы, гранты и следующий шаг.',
    icon: FiTrendingUp,
  },
  {
    title: 'AI как наставник',
    text: 'Используем AI, чтобы объяснять сложное простыми словами и давать персональные рекомендации.',
    icon: FiCpu,
  },
];

const AboutProject: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="min-h-screen bg-white px-4 py-8 dark:bg-black md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 dark:border-gray-800 dark:from-gray-950 dark:via-black dark:to-gray-900 md:p-10">
          <motion.div
            className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-400/20"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/20"
            animate={{ scale: [1.05, 1, 1.05], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative">
            <p className="mb-3 inline-flex rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:text-gray-300">
              About Respawn
            </p>
            <h1 className="text-3xl font-black text-black dark:text-white md:text-5xl">О проекте</h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
              Respawn создан, чтобы школьникам и студентам Казахстана было проще выбрать профессию, понять траекторию
              поступления и уверенно сделать первый шаг в карьеру.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/70">
                🎭 Симуляция профессии
              </div>
              <div className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/70">
                🎯 Персональный разбор
              </div>
              <div className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900/70">
                📄 Готовое портфолио
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valueCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800"
              >
                <div className="mb-3 inline-flex rounded-xl bg-gray-100 p-2 dark:bg-gray-900">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-black dark:text-white">{card.title}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.text}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-gray-200 p-6 dark:border-gray-800 md:p-8">
          <div className="mb-5 flex items-center gap-2">
            <FiTarget className="text-lg text-black dark:text-white" />
            <h2 className="text-2xl font-bold text-black dark:text-white">Как работает Respawn</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: '1. Выбор направления',
                text: 'Пользователь выбирает категорию и профессию, добавляет достижения и получает персональный контекст.',
              },
              {
                title: '2. Shadowing AI',
                text: 'Проходит интерактивную симуляцию с реальными решениями и получает моментальную обратную связь.',
              },
              {
                title: '3. Результат и рост',
                text: 'Получает сильные стороны, образовательную стратегию, грантовый ориентир и текст в портфолио.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"
              >
                <p className="font-semibold text-black dark:text-white">{step.title}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 p-6 dark:border-gray-800 md:p-8">
          <div className="mb-5 flex items-center gap-2">
            <FiBookOpen className="text-lg text-black dark:text-white" />
            <h2 className="text-2xl font-bold text-black dark:text-white">Q & A</h2>
          </div>

          <div className="space-y-3">
            {qaItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.question} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="font-medium text-black dark:text-white">{item.question}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <p className="border-t border-gray-200 px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-400 sm:px-5">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutProject;
