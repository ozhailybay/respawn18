import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiBookOpen, FiBriefcase, FiCheck } from 'react-icons/fi';
import { validateInput, secureErrorHandler } from '../utils/security';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('school');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    displayName?: string; 
  }>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
    setValidationErrors({});
  }, []);

  const validateForm = (): boolean => {
    const errors: { 
      email?: string; 
      password?: string; 
      confirmPassword?: string; 
      displayName?: string; 
    } = {};

    // Validate display name
    if (!displayName.trim()) {
      errors.displayName = 'Имя обязательно';
    } else if (displayName.trim().length < 2) {
      errors.displayName = 'Имя должно содержать минимум 2 символа';
    } else if (displayName.trim().length > 50) {
      errors.displayName = 'Имя не должно превышать 50 символов';
    }

    // Validate email
    if (!email) {
      errors.email = 'Email обязателен';
    } else if (!validateInput.email(email)) {
      errors.email = 'Введите корректный email адрес';
    }

    // Validate password
    if (!password) {
      errors.password = 'Пароль обязателен';
    } else {
      const passwordValidation = validateInput.password(password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    if (!acceptTerms) {
      setError('Необходимо принять условия использования');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, displayName, role);
      navigate('/');
    } catch (err) {
      const error = err as Error;
      secureErrorHandler.logError(error, 'Signup component');
      setError(secureErrorHandler.sanitizeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
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

            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                <span className="font-medium">Полное</span> имя
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light ${
                    validationErrors.displayName 
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white'
                  }`}
                  placeholder="Ваше полное имя"
                />
              </div>
              {validationErrors.displayName && (
                <p className="text-red-600 dark:text-red-400 text-sm">{validationErrors.displayName}</p>
              )}
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
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light ${
                      validationErrors.email 
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white'
                    }`}
                  placeholder="your@email.com"
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-600 dark:text-red-400 text-sm">{validationErrors.email}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300">
                <span className="font-medium">Я</span> ищу:
              </label>
              <div className="grid grid-cols-1 gap-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-lg border ${
                    role === 'school' 
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-black'
                  } p-4 cursor-pointer transition-all hover:border-black dark:hover:border-white group`}
                  onClick={() => setRole('school')}
                >
                  <div className="flex items-center">
                  <input
                    type="radio"
                      id="role-school"
                    name="role"
                    value="school"
                    checked={role === 'school'}
                    onChange={() => setRole('school')}
                      className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-700"
                  />
                    <div className="ml-3 flex-1">
                    <div className="flex items-center">
                        <FiBookOpen className="w-5 h-5 mr-2 text-black dark:text-white group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-black dark:text-white">Работу</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-light mt-1">
                        Поиск вакансий и карьерных возможностей
                      </p>
                    </div>
                </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-lg border ${
                    role === 'business' 
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-black'
                  } p-4 cursor-pointer transition-all hover:border-black dark:hover:border-white group`}
                  onClick={() => setRole('business')}
                >
                  <div className="flex items-center">
                  <input
                    type="radio"
                    id="role-business"
                    name="role"
                    value="business"
                    checked={role === 'business'}
                    onChange={() => setRole('business')}
                      className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-700"
                  />
                    <div className="ml-3 flex-1">
                    <div className="flex items-center">
                        <FiBriefcase className="w-5 h-5 mr-2 text-black dark:text-white group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-black dark:text-white">Сотрудников</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-light mt-1">
                        Размещение вакансий и поиск талантов
                      </p>
                    </div>
                </div>
                </motion.div>
              </div>
              </div>

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
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light ${
                      validationErrors.password 
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white'
                    }`}
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
              {validationErrors.password && (
                <p className="text-red-600 dark:text-red-400 text-sm">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-light text-gray-700 dark:text-gray-300">
                <span className="font-medium">Подтвердите</span> пароль
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 bg-white dark:bg-black text-gray-900 dark:text-white transition-all duration-200 font-light ${
                    validationErrors.confirmPassword 
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white'
                  }`}
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
              {validationErrors.confirmPassword && (
                <p className="text-red-600 dark:text-red-400 text-sm">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="accept-terms" className="text-gray-700 dark:text-gray-300 font-light">
                  Я соглашаюсь с{' '}
                  <Link to="/terms" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline">
                    Условиями использования
                  </Link>
                  {' '}и{' '}
                  <Link to="/privacy" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline">
                    Политикой конфиденциальности
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !acceptTerms}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="flex items-center space-x-2">
                <span>{isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}</span>
                {!isLoading && <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </motion.button>
          </form>

          {/* Social Login */}
          <div className="mt-8">
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-700 text-sm font-light rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-black dark:hover:border-white transition-all duration-200 group"
              >
                <svg className="h-5 w-5 text-[#4285F4] group-hover:scale-110 transition-transform" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
              
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
          </div>
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

export default SignUp; 