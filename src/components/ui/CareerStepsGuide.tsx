import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiFileText, 
  FiSearch, 
  FiBriefcase,
  FiArrowRight,
  FiCheck,
  FiPlay,
  FiBook,
  FiTarget,
  FiTrendingUp,
  FiStar,
  FiCode,
  FiUsers,
  FiAward
} from 'react-icons/fi';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  tasks: string[];
  tips: string[];
  resources: Array<{
    name: string;
    type: 'course' | 'tool' | 'platform' | 'article';
    description: string;
  }>;
  timeframe: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Определи свои интересы и навыки",
    description: "Первый шаг к успешной карьере - понимание себя",
    icon: <FiUser className="w-8 h-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    timeframe: "1-2 недели",
    tasks: [
      "Пройди тесты на профориентацию",
      "Составь список своих увлечений",
      "Определи сильные стороны",
      "Изучи востребованные профессии",
      "Поговори с родителями и друзьями"
    ],
    tips: [
      "Не бойся пробовать новое",
      "Записывай все идеи в блокнот",
      "Обращай внимание на то, что тебе легко дается",
      "Изучай истории успеха в разных сферах"
    ],
    resources: [
      {
        name: "Профориентационные тесты",
        type: "tool",
        description: "Онлайн-тесты для определения склонностей"
      },
      {
        name: "Карьерные гиды",
        type: "article",
        description: "Статьи о современных профессиях"
      },
      {
        name: "YouTube каналы о карьере",
        type: "platform",
        description: "Видео о разных профессиях от практиков"
      }
    ]
  },
  {
    id: 2,
    title: "Развивай навыки и создавай портфолио",
    description: "Время изучать и практиковаться",
    icon: <FiBook className="w-8 h-8" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
    timeframe: "2-6 месяцев",
    tasks: [
      "Изучай основы выбранной сферы",
      "Проходи онлайн-курсы",
      "Создавай учебные проекты",
      "Участвуй в хакатонах и конкурсах",
      "Веди блог или соцсети по теме"
    ],
    tips: [
      "Учись понемногу, но регулярно",
      "Документируй свой прогресс",
      "Не бойся делать ошибки",
      "Ищи ментора или наставника",
      "Присоединяйся к сообществам"
    ],
    resources: [
      {
        name: "Coursera",
        type: "course",
        description: "Курсы от ведущих университетов"
      },
      {
        name: "GitHub",
        type: "platform",
        description: "Платформа для размещения проектов"
      },
      {
        name: "Behance",
        type: "platform",
        description: "Портфолио для дизайнеров"
      },
      {
        name: "Хабр",
        type: "platform",
        description: "Сообщество IT-специалистов"
      }
    ]
  },
  {
    id: 3,
    title: "Составь резюме и профиль",
    description: "Покажи себя с лучшей стороны",
    icon: <FiFileText className="w-8 h-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    timeframe: "1-2 недели",
    tasks: [
      "Создай профессиональное резюме",
      "Заполни профили в LinkedIn и HeadHunter",
      "Добавь свои проекты и достижения",
      "Получи рекомендации от учителей",
      "Сделай профессиональные фото"
    ],
    tips: [
      "Используй простой и читаемый дизайн",
      "Подчеркивай достижения, а не обязанности",
      "Адаптируй резюме под каждую вакансию",
      "Проверь грамматику и орфографию",
      "Попроси друзей проверить резюме"
    ],
    resources: [
      {
        name: "Canva",
        type: "tool",
        description: "Инструмент для создания красивых резюме"
      },
      {
        name: "LinkedIn Learning",
        type: "course",
        description: "Курсы по составлению резюме"
      },
      {
        name: "Grammarly",
        type: "tool",
        description: "Проверка грамматики и стиля"
      }
    ]
  },
  {
    id: 4,
    title: "Ищи возможности и подавайся",
    description: "Пора искать первую работу или стажировку",
    icon: <FiSearch className="w-8 h-8" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    timeframe: "Постоянно",
    tasks: [
      "Ищи стажировки и junior позиции",
      "Подавайся на фриланс-проекты",
      "Участвуй в карьерных ярмарках",
      "Используй нетворкинг",
      "Готовься к собеседованиям"
    ],
    tips: [
      "Не ограничивайся только крупными компаниями",
      "Рассматривай удаленную работу",
      "Будь готов к отказам - это нормально",
      "Продолжай учиться и развиваться",
      "Просить обратную связь после собеседований"
    ],
    resources: [
      {
        name: "HeadHunter",
        type: "platform",
        description: "Крупнейший сайт поиска работы"
      },
      {
        name: "Freelance.ru",
        type: "platform",
        description: "Платформа для фриланс-проектов"
      },
      {
        name: "Telegram каналы",
        type: "platform",
        description: "Каналы с вакансиями и стажировками"
      },
      {
        name: "Meetup",
        type: "platform",
        description: "Профессиональные мероприятия и нетворкинг"
      }
    ]
  }
];

const CareerStepsGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStepCompletion = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course': return <FiBook className="w-4 h-4" />;
      case 'tool': return <FiCode className="w-4 h-4" />;
      case 'platform': return <FiUsers className="w-4 h-4" />;
      case 'article': return <FiFileText className="w-4 h-4" />;
      default: return <FiStar className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          4 шага до первой работы
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Пошаговый план для подростков: от самопознания до первой вакансии или проекта
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.button
                onClick={() => setActiveStep(step.id)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300
                  ${activeStep === step.id 
                    ? `${step.bgColor} ${step.color}` 
                    : completedSteps.includes(step.id)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {completedSteps.includes(step.id) ? (
                  <FiCheck className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </motion.button>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 md:w-24 h-1 mx-2
                  ${completedSteps.includes(step.id) ? 'bg-green-300' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-sm text-gray-500">
            Прогресс: {completedSteps.length} из {steps.length} шагов завершено
          </span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {steps.map((step) => (
          <motion.button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`
              p-4 rounded-xl text-left transition-all duration-300
              ${activeStep === step.id 
                ? `${step.bgColor} border-2 border-current ${step.color}` 
                : 'bg-white border border-gray-200 hover:border-gray-300'
              }
            `}
            whileHover={{ y: -2 }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${step.bgColor} ${step.color}`}>
              {step.icon}
            </div>
            <h3 className="font-medium text-gray-900 text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500">{step.timeframe}</p>
          </motion.button>
        ))}
      </div>

      {/* Active Step Content */}
      <AnimatePresence mode="wait">
        {steps.map((step) => (
          activeStep === step.id && (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step.bgColor} ${step.color}`}>
                    {step.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                    <p className="text-gray-600">{step.description}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      ⏱ {step.timeframe}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleStepCompletion(step.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${completedSteps.includes(step.id)
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {completedSteps.includes(step.id) ? (
                    <>
                      <FiCheck className="w-4 h-4 inline mr-2" />
                      Завершено
                    </>
                  ) : (
                    'Отметить как выполненное'
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tasks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTarget className="w-5 h-5 mr-2 text-blue-600" />
                    Что делать
                  </h3>
                  <ul className="space-y-3">
                    {step.tasks.map((task, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Полезные советы
                  </h3>
                  <ul className="space-y-3">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiStar className="w-5 h-5 mr-2 text-purple-600" />
                    Ресурсы
                  </h3>
                  <div className="space-y-3">
                    {step.resources.map((resource, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="text-purple-600">
                            {getResourceIcon(resource.type)}
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm">{resource.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Предыдущий шаг
                </button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    Шаг {activeStep} из {steps.length}
                  </span>
                </div>
                
                <button
                  onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                  disabled={activeStep === steps.length}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующий шаг
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Motivational Footer */}
      <motion.div 
        className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Помни: каждый эксперт когда-то был новичком! 🚀
        </h3>
        <p className="text-gray-600 mb-4">
          Не бойся начинать, не бойся ошибаться. Главное - делать первые шаги и не останавливаться.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedSteps.length}</div>
            <div className="text-sm text-gray-500">Завершено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{steps.length - completedSteps.length}</div>
            <div className="text-sm text-gray-500">Осталось</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CareerStepsGuide; 