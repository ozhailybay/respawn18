import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

interface UserProfileErrorProps {
  error: string;
  onRetry?: () => void;
  showBackButton?: boolean;
}

const UserProfileError: React.FC<UserProfileErrorProps> = ({ 
  error, 
  onRetry, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    navigate('/profile/edit');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <FaExclamationTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ошибка профиля
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {error === 'User profile not found' 
            ? 'Ваш профиль не найден. Пожалуйста, заполните профиль для продолжения.'
            : error || 'Произошла ошибка при загрузке профиля.'
          }
        </p>
        
        <div className="space-y-3">
          {error === 'User profile not found' && (
            <button
              onClick={handleCompleteProfile}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FaUserPlus className="mr-2" />
              Заполнить профиль
            </button>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Попробовать снова
            </button>
          )}
          
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Назад
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileError; 