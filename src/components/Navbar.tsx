import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: 'Главная', to: '/' },
    { label: 'Симуляция', to: '/shadow' },
    { label: 'Резюме', to: '/resume-generator' },
    { label: 'AI Ментор', to: '/ai-mentor' },
    { label: 'Университеты и Гранты', to: '/jobs' },
    { label: 'О проекте', to: '/about-project' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-black/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="text-lg font-bold text-black dark:text-white">
          Respawn
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm ${
                location.pathname === item.to
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/shadow" className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
          Начать
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

