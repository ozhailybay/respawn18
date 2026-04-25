import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useUserContext } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiBookOpen, FiBriefcase, FiCheck } from 'react-icons/fi';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { SHADOW_FIRST_LOGIN_KEY } from '../components/shadowing/storage';

type UserRole = 'school';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('school');
  const [aboutMe, setAboutMe] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [shadowData, setShadowData] = useState<{ profession?: string } | null>(null);
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    setError('');
  }, []);

  useEffect(() => {
    try {
      const onboardingRaw = localStorage.getItem('shadowData');
      const resultRaw = localStorage.getItem('shadowResult');
      const onboardingData = onboardingRaw ? (JSON.parse(onboardingRaw) as { profession?: string }) : null;
      const resultData = resultRaw ? (JSON.parse(resultRaw) as { portfolio_text?: string }) : null;

      if (onboardingData) {
        setShadowData(onboardingData);
        setRole('school');
      }

      if (resultData?.portfolio_text) {
        setAboutMe(resultData.portfolio_text);
      }
    } catch {
      setShadowData(null);
    }
  }, []);

  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return false;
    }
    if (!email.trim()) {
      setError('Пожалуйста, введите ваш email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Пожалуйста, введите корректный email');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }

    if (!acceptTerms) {
      return setError('Необходимо принять условия использования');
    }

        setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });

      const finalRole: UserRole = 'school';

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
          email,
        displayName: name,
          role: finalRole,
        about: aboutMe,
        createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          profileCompleted: false,
        shadowProfession: shadowData?.profession || null,
        shadowClassGrade: null,
        });

      if (shadowData?.profession) {
        localStorage.setItem(SHADOW_FIRST_LOGIN_KEY, shadowData.profession);
      }
        
        navigate('/dashboard');
      } catch (err: any) {
      let errorMessage = 'Не удалось создать аккаунт. Попробуйте еще раз.';
        
        if (err.code === 'auth/email-already-in-use') {
          errorMessage = 'Этот email уже используется другим аккаунтом';
        } else if (err.code === 'auth/invalid-email') {
          errorMessage = 'Неверный формат email';
        } else if (err.code === 'auth/weak-password') {
          errorMessage = 'Слишком слабый пароль';
        }
        
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    navigate('/dashboard');
  };

  const handleGoogleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      {/* Subtle animated background elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-20 left-4 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute bottom-20 right-4 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-medium text-lg group-hover:scale-105 transition-transform">
              J
            </div>
            <span className="text-2xl font-light text-black dark:text-white">
              <span className="font-extralight">Jumys</span>
              <span className="font-bold ml-1">Al</span>
            </span>
          </Link>

          {/* Creative Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white mb-4"
          >
            <span className="font-thin">Начните свою </span>
            <span className="font-bold italic underline decoration-wavy decoration-2 underline-offset-4">карьеру</span>
            <span className="font-thin"> сегодня</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400 font-light"
          >
            Уже есть аккаунт?{' '}
            <Link 
              to="/login" 
              className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline decoration-dotted underline-offset-2 transition-all duration-300"
            >
              Войдите
            </Link>
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:border-black dark:hover:border-white transition-all duration-300"
        >
          {/* Progress indicator */}
          <div className="relative mb-8">
            <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    step >= stepNumber 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {stepNumber}
              </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {stepNumber === 1 && 'Личные данные'}
                {stepNumber === 2 && 'Пароль'}
                {stepNumber === 3 && 'Роль'}
                  </span>
              </div>
              ))}
            </div>
            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-black dark:bg-white"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <p className="text-red-700 dark:text-red-300 text-sm font-light">{error}</p>
              </motion.div>
            )}
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Полное</span> имя
            </label>
                    <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
              </div>
              <input
                        id="name"
                      type="text"
                        required
                value={name}
                onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light"
                        placeholder="Ваше полное имя"
              />
            </div>
          </div>
          
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Email</span> адрес
            </label>
                    <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
              </div>
              <input
                        id="email"
                      type="email"
                        required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light"
                      placeholder="your@email.com"
              />
            </div>
          </div>

                  {/* Social Login Section */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white dark:bg-black px-4 text-gray-500 dark:text-gray-400 font-light">
                        <span className="italic">или продолжите с</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <GoogleSignInButton
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="Google"
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 text-sm font-light rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-black dark:hover:border-white transition-all duration-200"
                    />
                    
                    <button
                      type="button"
                      className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-700 text-sm font-light rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-black dark:hover:border-white transition-all duration-200 group"
                    >
                      <svg className="h-5 w-5 text-[#1DA1F2] group-hover:scale-110 transition-transform" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 5.9c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-.8-.8-1.8-1.3-3-1.3-2.3 0-4.1 1.9-4.1 4.1 0 .3 0 .6.1.9-3.4-.2-6.4-1.8-8.4-4.3-.4.6-.6 1.3-.6 2 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4-.3.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.6 2.1 2.8 3.9 2.8-1.4 1.1-3.2 1.8-5.1 1.8-.3 0-.7 0-1-.1 1.8 1.2 4 1.9 6.3 1.9 7.6 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2"/>
                      </svg>
                      <span className="ml-2">Twitter</span>
                    </button>
          </div>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Пароль</span>
            </label>
                    <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
              </div>
              <input
                id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light"
                        placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
            </div>
          </div>
          
                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Подтвердите</span> пароль
            </label>
                    <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCheck className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                    </div>
                    <input
                      id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
              </motion.div>
            )}
            
            {step === 3 && (
              <motion.div
                key="step3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Role Selection */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    Роль аккаунта: <b>school</b>.
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="about" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                      <span className="font-medium">О себе</span>
                    </label>
                    <textarea
                      id="about"
                      rows={5}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      placeholder="Коротко расскажите о себе"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 transition-all duration-200 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder-gray-500 dark:focus:border-white dark:focus:ring-white"
                    />
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 font-light">
                      Я соглашаюсь с{' '}
                      <Link to="/terms" className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline decoration-dotted underline-offset-2 transition-colors">
                        Условиями использования
                      </Link>
                      {' '}и{' '}
                      <Link to="/privacy" className="font-medium text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline decoration-dotted underline-offset-2 transition-colors">
                        Политикой конфиденциальности
                      </Link>
                    </label>
          </div>
              </motion.div>
            )}
          </AnimatePresence>
          
            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4">
            {step > 1 && (
              <motion.button
                type="button"
                onClick={prevStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-black dark:hover:border-white transition-all duration-200 font-light"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </motion.button>
            )}
            
            <motion.button
            type="submit"
            disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative ${step === 1 ? 'w-full' : 'flex-1'} flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
              >
                <span className="flex items-center space-x-2">
                  <span>
                    {loading ? 'Создание аккаунта...' : 
                     step === 3 ? 'Создать аккаунт' : 'Продолжить'}
                  </span>
                  {!loading && <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
            </motion.button>
          </div>
          </form>
        </motion.div>
        
        {/* Additional Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
            Присоединяясь к{' '}
            <span className="font-medium italic">Jumys Al</span>, вы становитесь частью{' '}
            <span className="font-medium">растущего сообщества</span> профессионалов
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup; 