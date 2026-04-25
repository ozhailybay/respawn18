import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { FaDatabase, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AdminMigration: React.FC = () => {
  const { userData } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, является ли пользователь админом
  const isAdmin = userData?.role === 'admin';

  const handleMigration = async () => {
    if (!isAdmin) {
      setError('Доступ запрещен. Требуются права администратора.');
      return;
    }

    setMigrating(true);
    setError(null);
    setResult(null);

    try {
      const functions = getFunctions();
      const migrateUsers = httpsCallable(functions, 'migrateExistingUsers');
      
      const response = await migrateUsers();
      setResult(response.data);
      console.log('Migration result:', response.data);
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message || 'Ошибка при миграции');
    } finally {
      setMigrating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <FaExclamationTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Доступ запрещен
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            Для доступа к этой странице требуются права администратора.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mr-4">
              <FaDatabase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Миграция пользователей
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Создание документов Firestore для существующих пользователей Firebase Auth
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
            <div className="flex">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Внимание
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Эта операция создаст документы Firestore для всех пользователей Firebase Auth, 
                  у которых еще нет соответствующих документов. Операция может занять некоторое время.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleMigration}
            disabled={migrating}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
              migrating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors`}
          >
            {migrating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Миграция в процессе...
              </>
            ) : (
              <>
                <FaDatabase className="mr-2" />
                Запустить миграцию
              </>
            )}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Ошибка
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex">
                <FaCheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Миграция завершена
                  </h3>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                    <p>Всего пользователей: {result.total}</p>
                    <p>Создано документов: {result.created}</p>
                    <p>Пропущено (уже существуют): {result.skipped}</p>
                    <p>Ошибок: {result.errors}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Что делает миграция?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Получает список всех пользователей из Firebase Auth
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Проверяет наличие соответствующих документов в Firestore
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Создает документы для пользователей, у которых их нет
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Пропускает пользователей, у которых документы уже существуют
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMigration; 