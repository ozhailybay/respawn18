import { useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  UserCredential,
  updateProfile,
  getAdditionalUserInfo,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for handling Google authentication
 */
export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Redirect to Google sign-in
      await signInWithRedirect(auth, provider);
      // User will be redirected to Google, then back to our app
      // The result will be handled in the main App component or AuthContext
      
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      
      let errorMessage = 'Не удалось войти через Google';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Вход через Google был отменен';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Всплывающее окно было заблокировано. Пожалуйста, разрешите всплывающие окна для этого сайта';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Аккаунт с этим email уже существует с другим методом входа';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    signInWithGoogle,
    loading,
    error
  };
};

export default useGoogleAuth; 