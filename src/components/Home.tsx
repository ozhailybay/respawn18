import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen, FiCpu, FiDollarSign, FiFileText, FiPlay } from 'react-icons/fi';

const cardAnim = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
  viewport: { once: true },
};

const flowCards = [
  {
    title: 'Симуляция',
    subtitle: 'Реальные сценарии и быстрые решения',
    badge: '01',
    position: 'left',
  },
  {
    title: 'Финансовый маршрут',
    subtitle: 'Зарплаты, вузы и гранты по траектории',
    badge: '02',
    position: 'top',
  },
  {
    title: 'Портфолио',
    subtitle: 'Готовый текст о себе за минуты',
    badge: '03',
    position: 'right',
  },
] as const;

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-gray-200/70 blur-3xl dark:bg-gray-800/60"
            animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gray-200/70 blur-3xl dark:bg-gray-800/60"
            animate={{ x: [0, -20, 0], y: [0, -20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="mb-4 inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold tracking-wider text-gray-600 dark:border-gray-700 dark:text-gray-300">
              SHADOWING AI / RESPAWN
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Узнай свою профессию
              <span className="block bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                через симуляцию
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
              Проживи реальный рабочий день, получи финансовый маршрут и готовый текст портфолио —
              всё за несколько минут в одном интерактивном флоу.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shadow"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white shadow-xl transition hover:translate-y-[-1px] dark:bg-white dark:text-black"
              >
                <FiPlay className="h-5 w-5" />
                Начать симуляцию
              </Link>
              <Link
                to="/result"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-8 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
              >
                Посмотреть пример результата
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              <FiCpu />
              Рабочий сценарий
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
                “На смене одновременно две критические задачи, и решение нужно принять за 90 секунд…”
              </div>
              <div className="rounded-xl bg-black p-4 text-sm text-white dark:bg-white dark:text-black">
                AI учитывает твой ответ, показывает последствия и ведет дальше по сценарию.
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
                После 3 решений ты получаешь fit-score, зарплаты, вузы, гранты и готовый профильный текст.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black md:p-8">
            <div className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-50">
              <div className="h-full w-full bg-[linear-gradient(to_right,rgba(120,120,120,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.12)_1px,transparent_1px)] bg-[size:34px_34px]" />
            </div>
            <motion.div
              className="pointer-events-none absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-400/10"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold md:text-2xl">Как работает твой карьерный маршрут</h2>
                <div className="rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-gray-700">
                  AI Flow
                </div>
              </div>

              <div className="md:hidden">
                <div className="mb-5 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-blue-300/50 bg-white/90 shadow-[0_0_0_10px_rgba(59,130,246,0.12)] dark:border-blue-400/40 dark:bg-black/90">
                    <FiCpu className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  {flowCards.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-300/80 bg-white/95 p-4 shadow-[0_12px_24px_rgba(0,0,0,0.08)] dark:border-gray-700 dark:bg-black/95"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.badge}</span>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs dark:border-gray-700">
                          ✓
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{item.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden h-[430px] md:block">
                <div className="absolute inset-0 mx-auto grid w-full max-w-[860px] grid-cols-3 grid-rows-[1fr_auto_1fr] place-items-center">
                  <div className="pointer-events-none absolute inset-x-12 inset-y-8 rounded-[40px] border border-gray-400/15" />
                  <div className="pointer-events-none absolute left-1/2 top-[112px] h-[88px] w-px -translate-x-1/2 border-l border-dashed border-gray-400/60 dark:border-gray-600/70" />
                  <div className="pointer-events-none absolute left-[17%] top-[50%] h-px w-[30%] -translate-y-1/2 border-t border-dashed border-gray-400/60 dark:border-gray-600/70" />
                  <div className="pointer-events-none absolute right-[17%] top-[50%] h-px w-[30%] -translate-y-1/2 border-t border-dashed border-gray-400/60 dark:border-gray-600/70" />

                  {flowCards.map((item, index) => {
                    const slotClass =
                      item.position === 'left'
                        ? 'col-start-1 row-start-2'
                        : item.position === 'top'
                          ? 'col-start-2 row-start-1'
                          : 'col-start-3 row-start-2';

                    return (
                      <motion.div
                        key={item.title}
                        className={`${slotClass} z-10 w-[220px] rounded-2xl border border-gray-300/80 bg-white/95 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.10)] dark:border-gray-700 dark:bg-black/95`}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{item.badge}</span>
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs dark:border-gray-700">
                            ✓
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold md:text-base">{item.title}</h3>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{item.subtitle}</p>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    className="relative col-start-2 row-start-2 z-20 flex h-28 w-28 items-center justify-center rounded-full border border-blue-300/50 bg-white/95 shadow-[0_0_0_14px_rgba(59,130,246,0.14)] dark:border-blue-400/40 dark:bg-black/95"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className="absolute inset-[-22px] rounded-[32px] border border-blue-300/35 dark:border-blue-500/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    />
                    <FiCpu className="relative h-8 w-8" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <motion.div {...cardAnim} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="mb-3 inline-flex rounded-xl bg-gray-100 p-2 dark:bg-gray-900">
              <FiBookOpen />
            </div>
            <h3 className="text-lg font-semibold">Профориентация через опыт</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Не тест “угадай профессию”, а практическая симуляция реального дня.
            </p>
          </motion.div>
          <motion.div {...cardAnim} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="mb-3 inline-flex rounded-xl bg-gray-100 p-2 dark:bg-gray-900">
              <FiDollarSign />
            </div>
            <h3 className="text-lg font-semibold">Понятная экономика роста</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Джун → мид → сеньор с зарплатными вилками и образовательной траекторией.
            </p>
          </motion.div>
          <motion.div {...cardAnim} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="mb-3 inline-flex rounded-xl bg-gray-100 p-2 dark:bg-gray-900">
              <FiFileText />
            </div>
            <h3 className="text-lg font-semibold">Готовое портфолио за минуты</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Текст о себе формируется автоматически и готов для резюме/профиля.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

