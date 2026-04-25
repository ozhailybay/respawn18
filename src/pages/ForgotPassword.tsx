import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Basic email validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login', // Redirect to login after password reset
        handleCodeInApp: true
      });

      setSuccess(true);
      setEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later');
          break;
        default:
          setError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Subtle animated background elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-[10%] w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 right-[10%] w-80 h-80 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-light text-black dark:text-white mb-2">
            <span className="font-thin">Восстановление</span>
            <span className="font-bold ml-2">Пароля</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-light">
            Введите ваш email адрес и мы отправим вам ссылку для восстановления пароля
          </p>
        </motion.div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white p-4 rounded-xl mb-6"
          >
            <p className="font-medium">Письмо для восстановления пароля отправлено!</p>
            <p className="text-sm mt-1 font-light">
              Проверьте вашу почту для получения инструкций по восстановлению пароля.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-black border-2 border-red-500 text-red-600 dark:text-red-400 p-4 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email адрес
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-all duration-200 font-light"
                placeholder="Введите ваш email"
                required
                disabled={loading}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white dark:border-black"></div>
                  <span className="ml-2">Отправка...</span>
                </div>
              ) : (
                'Отправить ссылку для восстановления'
              )}
            </motion.button>
          </form>
        )}

        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 font-light"
          >
            Вернуться к входу
          </motion.button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="font-light">
            Не получили письмо? Проверьте папку спам или{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              попробуйте снова
            </motion.button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 