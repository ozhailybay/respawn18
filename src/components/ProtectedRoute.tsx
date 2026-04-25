import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { currentUser, userData, loading, error } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока AuthContext инициализируется
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на логин
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуется профиль, но его нет или есть ошибка
  if (requireProfile && (!userData || error)) {
    return <Navigate to="/profile/edit" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 