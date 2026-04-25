import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../types';

export const useProfile = () => {
  const { currentUser, userData, loading: authLoading, error: authError } = useAuth();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Используем данные из AuthContext, если они есть
        if (userData) {
          setProfile(userData as UserData);
          setLoading(false);
          return;
        }

        // Если данных нет в AuthContext, загружаем из Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          setError('User profile not found');
          setLoading(false);
          return;
        }

        const profileData = userSnapshot.data() as UserData;
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [currentUser?.uid, userData, authLoading, authError]);

  const updateProfile = async (updates: Partial<UserData>) => {
    if (!currentUser?.uid) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setUpdating(true);
      setError(null);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Обновляем локальное состояние
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Ошибка обновления профиля');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // Перезапускаем загрузку
    if (currentUser?.uid) {
      const userRef = doc(db, 'users', currentUser.uid);
      getDoc(userRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserData);
          } else {
            setError('User profile not found');
          }
        })
        .catch(err => {
          console.error('Error retrying fetch:', err);
          setError('Ошибка загрузки профиля');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return {
    profile,
    loading: loading || authLoading,
    error: error || authError,
    updating,
    updateProfile,
    retryFetch
  };
}; 