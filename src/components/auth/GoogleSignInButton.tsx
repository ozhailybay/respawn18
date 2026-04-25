import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';

export interface GoogleSignInButtonProps {
  onSuccess: () => void;
  onError: (errorMsg: string) => void;
  className?: string;
  children?: ReactNode;
  text?: string;
  fullWidth?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  children,
  text = 'Войти с Google',
  fullWidth = false
}) => {
  const { signInWithGoogle, loading, error } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // onSuccess() будет вызван после редиректа
    } catch (error: any) {
      onError(error.message);
    }
  };

  // Animation variants
  const buttonVariants = {
    idle: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' },
    hover: { 
      scale: 1.02, 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.1)',
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`
        flex items-center justify-center gap-3 px-4 py-3 
        bg-white dark:bg-dark-lighter border border-gray-300 dark:border-dark-border 
        rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-dark-light
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <FcGoogle className="text-xl flex-shrink-0" />
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {loading ? 'Загрузка...' : text}
      </span>
      {loading && (
        <svg className="animate-spin ml-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
    </motion.button>
  );
};

export default GoogleSignInButton; 