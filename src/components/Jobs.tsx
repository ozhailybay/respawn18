import React from 'react';
import { FiAward, FiBookOpen, FiCalendar, FiCheckCircle, FiGlobe, FiTrendingUp } from 'react-icons/fi';

type AdmissionTrack = 'ЕНТ' | 'SAT/IELTS' | 'Комбинированный';

interface UniversityItem {
  name: string;
  city: string;
  tracks: AdmissionTrack[];
  passing: string;
  specialties: string;
  details: string;
}

interface GrantItem {
  name: string;
  amount: string;
  who: string;
  note: string;
}

const universities: UniversityItem[] = [
  {
    name: 'Nazarbayev University',
    city: 'Астана',
    tracks: ['SAT/IELTS'],
    passing: 'NUET или SAT + IELTS (обычно от 6.0), конкурс высокий',
    specialties: 'Computer Science, Engineering, Economics, Biological Sciences',
    details: 'Поступление через Foundation (NUFYP) или Undergraduate. ЕНТ не основной путь.',
  },
  {
    name: 'КазНУ им. аль-Фараби',
    city: 'Алматы',
    tracks: ['ЕНТ', 'Комбинированный'],
    passing: 'Зависит от направления, часто от 90+ на популярные программы',
    specialties: 'IT, Финансы, Международные отношения, Физика, Медицина (смежные)',
    details: 'Классический путь через ЕНТ + конкурс грантов МНВО РК.',
  },
  {
    name: 'ENU им. Л.Н. Гумилева',
    city: 'Астана',
    tracks: ['ЕНТ'],
    passing: 'Проходной балл зависит от года и группы программ',
    specialties: 'Информационные системы, Педагогика, Экономика, Юриспруденция',
    details: 'Сильный выбор для гуманитарных и технических направлений.',
  },
  {
    name: 'Satbayev University',
    city: 'Алматы',
    tracks: ['ЕНТ'],
    passing: 'Технические направления обычно требуют конкурентный ЕНТ',
    specialties: 'Горное дело, Нефтегаз, Automation, IT и инженерия',
    details: 'Один из ключевых технических вузов страны.',
  },
  {
    name: 'КБТУ',
    city: 'Алматы',
    tracks: ['Комбинированный', 'SAT/IELTS'],
    passing: 'ЕНТ/внутренний отбор, на англоязычных треках нужен английский',
    specialties: 'IT, Data Science, Finance, Petroleum Engineering',
    details: 'Есть внутренние стипендии и конкурсы для сильных абитуриентов.',
  },
  {
    name: 'Astana IT University (AITU)',
    city: 'Астана',
    tracks: ['ЕНТ', 'Комбинированный'],
    passing: 'Конкурс растет, приоритет у сильной математики/логики',
    specialties: 'Cybersecurity, Software Engineering, Big Data',
    details: 'Ориентация на цифровую экономику и практические IT-компетенции.',
  },
];

const grants: GrantItem[] = [
  {
    name: 'Госгрант МНВО РК (бакалавриат)',
    amount: 'Оплата обучения + стипендия (при очном обучении)',
    who: 'Абитуриенты по конкурсу ЕНТ',
    note: 'Основной массовый конкурс грантов по группе образовательных программ.',
  },
  {
    name: 'Целевые гранты акиматов',
    amount: 'Полное/частичное покрытие обучения',
    who: 'Выпускники регионов, приоритетные специальности',
    note: 'Часто предусматривают обязательство отработки в регионе после выпуска.',
  },
  {
    name: 'Внутренние гранты университетов',
    amount: 'От 25% до 100% стоимости обучения',
    who: 'Абитуриенты с высоким GPA, конкурсными достижениями и активностями',
    note: 'Обычно отдельные дедлайны и пакет документов внутри каждого вуза.',
  },
  {
    name: 'STEM и отраслевые стипендии',
    amount: 'Грант или ежемесячная поддержка',
    who: 'Кандидаты на IT, инженерные и научные направления',
    note: 'Нужно мониторить объявления вузов и партнерских компаний.',
  },
];

const deadlines = [
  'Май–июнь: регистрация на ЕНТ и финальный выбор профильных предметов.',
  'Июль: подача документов на конкурс госгрантов.',
  'Август: публикация списков обладателей грантов.',
  'Август–сентябрь: внутренние гранты вузов и донабор.',
];

const checklist = [
  'Определи 2-3 приоритетных направления (например: IT, инженерия, финансы).',
  'Собери карту вузов: город, требования, язык обучения, стоимость.',
  'Сделай стратегию поступления: основной путь + запасной путь.',
  'Подготовь документы заранее: сертификаты, мотивация, портфолио достижений.',
];

const trackStyles: Record<AdmissionTrack, string> = {
  ЕНТ: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'SAT/IELTS': 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  Комбинированный: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
};

const Jobs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white px-4 py-8 dark:bg-black md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 dark:border-gray-800 dark:from-gray-950 dark:via-black dark:to-gray-900 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-400/15" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15" />
          <div className="relative">
            <p className="mb-3 inline-flex rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:text-gray-300">
              Admission Guide 2026
            </p>
            <h1 className="text-3xl font-black text-black dark:text-white md:text-4xl">Университеты и Гранты</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
              Полная карта поступления по Казахстану: где нужен ЕНТ, где работает SAT/IELTS, как выбрать грантовую
              стратегию и не пропустить дедлайны.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-gray-700">ЕНТ треки</span>
              <span className="rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-gray-700">SAT/IELTS треки</span>
              <span className="rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-gray-700">Грантовая стратегия</span>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-5 flex items-center gap-2">
            <FiBookOpen className="text-lg text-black dark:text-white" />
            <h2 className="text-xl font-bold text-black dark:text-white md:text-2xl">Топ вузы и реальные треки поступления</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {universities.map((uni) => (
              <article
                key={uni.name}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">{uni.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{uni.city}</p>
                  </div>
                  <span className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">KZ</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {uni.tracks.map((track) => (
                    <span key={`${uni.name}-${track}`} className={`rounded-full px-3 py-1 text-xs font-medium ${trackStyles[track]}`}>
                      {track}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Проходной ориентир:</span> {uni.passing}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Сильные направления:</span> {uni.specialties}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">{uni.details}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <FiAward className="text-lg text-black dark:text-white" />
              <h2 className="text-xl font-bold text-black dark:text-white md:text-2xl">Гранты и финансирование</h2>
            </div>
            <div className="space-y-3">
              {grants.map((grant) => (
                <div key={grant.name} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="font-semibold text-black dark:text-white">{grant.name}</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Формат:</span> {grant.amount}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Кому:</span> {grant.who}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{grant.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-800">
              <div className="mb-3 flex items-center gap-2">
                <FiCalendar className="text-lg text-black dark:text-white" />
                <h3 className="text-lg font-bold text-black dark:text-white">Календарь абитуриента</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {deadlines.map((item) => (
                  <li key={item} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-800">
              <div className="mb-3 flex items-center gap-2">
                <FiCheckCircle className="text-lg text-black dark:text-white" />
                <h3 className="text-lg font-bold text-black dark:text-white">Чеклист перед подачей</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {checklist.map((item) => (
                  <li key={item} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <FiGlobe className="mb-2 text-lg text-black dark:text-white" />
            <h4 className="font-semibold text-black dark:text-white">Путь 1: ЕНТ</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Основной массовый путь на грант в большинство вузов РК.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <FiTrendingUp className="mb-2 text-lg text-black dark:text-white" />
            <h4 className="font-semibold text-black dark:text-white">Путь 2: SAT + IELTS</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Актуально для NU и международных/англоязычных треков.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <FiAward className="mb-2 text-lg text-black dark:text-white" />
            <h4 className="font-semibold text-black dark:text-white">Путь 3: Комбинированный</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Подача сразу в несколько вузов с разными каналами поступления.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Jobs;

