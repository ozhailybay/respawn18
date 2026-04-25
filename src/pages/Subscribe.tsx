import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { FiCheck, FiInfo, FiStar } from 'react-icons/fi';
import { FaChartLine, FaRobot, FaRegBuilding, FaUserTie, FaUserGraduate } from 'react-icons/fa';

const Subscribe: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'individual' | 'business'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: string, price: number) => {
    if (!user) {
      navigate('/login?redirect=subscription');
      return;
    }
    
    try {
      setSelectedPlan(plan);
      
      // Here would be the payment processing logic
      
      // After successful payment
      await updateDoc(doc(db, 'users', user.uid), {
        premium: true,
        plan: plan,
        subscriptionDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
        updatedAt: new Date()
      });
      
      navigate('/profile', { state: { subscribed: true, plan } });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  // Helper to apply discount for annual billing
  const applyDiscount = (price: number) => {
    return billingCycle === 'annual' ? Math.round(price * 0.8) : price;
  };

  // Helper to format price with currency
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-KZ')} ₸`;
  };

  // Individual plans data
  const individualPlans = [
    {
      id: 'free',
      name: 'Базовый',
      description: 'Идеально для начинающих поиск работы',
      price: 0,
      features: [
        'Доступ к общим вакансиям',
        'Базовый профиль',
        'До 10 откликов в месяц',
        'Базовый анализ резюме'
      ],
      color: 'bg-black dark:bg-white text-white dark:text-black',
      icon: <FaUserGraduate className="h-6 w-6" />
    },
    {
      id: 'pro',
      name: 'Продвинутый',
      description: 'Для активно ищущих работу',
      price: 4900,
      features: [
        'Все функции базового плана',
        'Неограниченные отклики',
        'Приоритетное отображение в поиске',
        'Автоматические рекомендации вакансий',
        'Улучшенный анализ резюме с AI',
        'Доступ к закрытым вакансиям'
      ],
      featured: true,
      color: 'bg-black dark:bg-white text-white dark:text-black',
      icon: <FaChartLine className="h-6 w-6" />
    },
    {
      id: 'career',
      name: 'Карьера',
      description: 'Максимальное развитие карьеры',
      price: 9900,
      features: [
        'Все функции продвинутого плана',
        'Персональный AI-карьерный консультант',
        'Генерация сопроводительных писем',
        'Персонализированный карьерный план',
        'Подготовка к собеседованиям с AI',
        'Расширенная аналитика профиля',
        'Статистика по отраслям и зарплатам'
      ],
      color: 'bg-black dark:bg-white text-white dark:text-black',
      icon: <FaRobot className="h-6 w-6" />
    }
  ];

  // Business plans data
  const businessPlans = [
    {
      id: 'startup',
      name: 'Стартап',
      description: 'Для небольших компаний',
      price: 14900,
      features: [
        'До 3 активных вакансий',
        'Базовый доступ к кандидатам',
        'Аналитика просмотров вакансий',
        'Чат с кандидатами',
        'Email поддержка'
      ],
      color: 'bg-black dark:bg-white text-white dark:text-black',
      icon: <FaRegBuilding className="h-6 w-6" />
    },
    {
      id: 'business',
      name: 'Бизнес',
      description: 'Для растущих компаний',
      price: 29900,
      features: [
        'До 10 активных вакансий',
        'Расширенный доступ к базе талантов',
        'AI-подбор релевантных кандидатов',
        'Брендированная страница компании',
        'Расширенная аналитика',
        'Приоритетное размещение вакансий',
        'Приоритетная поддержка'
      ],
      featured: true,
      color: 'bg-black dark:bg-white text-white dark:text-black',
      icon: <FaUserTie className="h-6 w-6" />
    },
    {
      id: 'enterprise',
      name: 'Корпоративный',
      description: 'Для крупных компаний',
      price: 59900,
      features: [
        'Неограниченное количество вакансий',
        'Полный доступ к базе талантов',
        'Продвинутый AI-подбор',
        'Персональный менеджер',
        'Интеграция с HR-системами',
        'API для разработчиков',
        'Обучение команды',
        'VIP-поддержка 24/7'
      ],
      color: 'bg-black dark:bg-white text-white dark:text-black',
      icon: <FaChartLine className="h-6 w-6" />
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black py-16 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-black/5 dark:bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gray-500/5 dark:bg-gray-400/5 blur-3xl"></div>
      </div>
      
      {/* Main content container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold mb-6 text-black dark:text-white"
          >
            Тарифные планы Respawn
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Выберите оптимальный план, соответствующий вашим карьерным целям или потребностям бизнеса
          </motion.p>
        </div>
        
        {/* User type toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 backdrop-blur-sm p-1 rounded-xl shadow-lg flex">
            <button
              onClick={() => setUserType('individual')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                userType === 'individual'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <FaUserGraduate className="mr-2" />
                <span>Для соискателей</span>
              </div>
            </button>
            <button
              onClick={() => setUserType('business')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                userType === 'business'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <FaRegBuilding className="mr-2" />
                <span>Для работодателей</span>
              </div>
            </button>
          </div>
        </motion.div>
        
        {/* Billing cycle toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <div className="flex items-center space-x-4 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-indigo-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
              Ежемесячно
            </span>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={billingCycle === 'annual'}
                onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              />
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            <div className="flex items-center">
              <span className={`text-sm ${billingCycle === 'annual' ? 'text-indigo-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                Ежегодно
              </span>
              <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-full">
                -20%
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Plans grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(userType === 'individual' ? individualPlans : businessPlans).map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`relative bg-white dark:bg-black rounded-2xl shadow-xl border-2 ${
                plan.featured 
                  ? 'border-black dark:border-white' 
                  : 'border-gray-200 dark:border-gray-700'
              } hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            >
              {plan.featured && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-max">
                  <div className="px-4 py-1 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold rounded-full shadow-lg flex items-center">
                    <FiStar className="mr-1" /> Популярный выбор
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <div className={`w-16 h-16 rounded-xl ${plan.color} text-white dark:text-black flex items-center justify-center mb-6 shadow-lg`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {formatPrice(applyDiscount(plan.price))}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {billingCycle === 'monthly' ? '/месяц' : '/год'}
                      </span>
                      
                      {billingCycle === 'annual' && (
                        <div className="mt-2 text-sm">
                          <span className="line-through text-gray-400 dark:text-gray-500 mr-2">
                            {formatPrice(plan.price * 12)}
                          </span>
                          <span className="text-green-500 font-medium">
                            Экономия {formatPrice(plan.price * 12 - applyDiscount(plan.price) * 12)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">Бесплатно</span>
                  )}
                </div>
                
                <div className="mb-8">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Возможности:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex">
                        <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleSubscribe(plan.id, plan.price)}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    plan.featured
                      ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg'
                      : plan.price > 0
                        ? 'bg-white text-black border border-black hover:bg-gray-50 dark:bg-transparent dark:border-white dark:text-white dark:hover:bg-gray-900'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? 'Обрабатывается...' : plan.price === 0 ? 'Начать бесплатно' : 'Выбрать план'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* FAQ section */}
        <div className="mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: 'Могу ли я сменить тариф в любое время?',
                a: 'Да, вы можете изменить свой тарифный план в любое время. При переходе на более дорогой тариф, вам будет начислена только разница в стоимости. При переходе на более дешевый тариф, изменения вступят в силу после окончания текущего платежного периода.'
              },
              {
                q: 'Как работает ежегодная оплата?',
                a: 'При выборе годового тарифа вы получаете скидку 20% от стоимости ежемесячной подписки. Оплата списывается единовременно за весь год вперед.'
              },
              {
                q: 'Есть ли пробный период?',
                a: 'Да, для всех платных тарифов доступен 7-дневный пробный период. В течение этого времени вы можете оценить все функции выбранного тарифа и при желании отменить подписку без списания средств.'
              },
              {
                q: 'Как отменить подписку?',
                a: 'Вы можете отменить подписку в любое время в разделе "Настройки" вашего профиля. После отмены вы сможете пользоваться всеми функциями до конца оплаченного периода.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Contact section */}
        <div className="mt-20 text-center">
          <h2 className="text-xl font-semibold mb-4">Нужен индивидуальный план?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Если вам требуются специальные условия или у вас есть вопросы, свяжитесь с нашей командой
          </p>
          <a 
            href="mailto:sales@respawn.kz"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
          >
            Связаться с отделом продаж
          </a>
        </div>
      </div>
    </div>
  );
};

export default Subscribe; 