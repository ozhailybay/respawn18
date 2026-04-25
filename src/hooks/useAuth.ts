import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  location?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  yearsOfExperience?: number;
  languages?: string[];
  [key: string]: any;
}

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null);
        return;
      }

      setUserLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({
            uid: user.uid,
            ...userDoc.data()
          } as UserData);
        } else {
          // Fallback to auth user data
          setUserData({
            uid: user.uid,
            displayName: user.displayName || undefined,
            email: user.email || undefined,
            photoURL: user.photoURL || undefined,
            role: 'student',
            skills: [],
            interests: [],
            bio: '',
            location: '',
            languages: []
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return {
    user,
    userData,
    loading: loading || userLoading,
    error
  };
}; 