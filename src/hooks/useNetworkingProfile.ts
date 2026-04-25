import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface NetworkingProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatar?: string;
  role: string;
  skills: string[];
  interests: string[];
  experience: 'entry' | 'mid' | 'senior';
  location: string;
  isRemote: boolean;
  availability: 'full-time' | 'part-time' | 'freelance' | 'project-based';
  portfolio?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  education: string;
  languages: string[];
  achievements: string[];
  projectsCreated: number;
  projectsJoined: number;
  applicationsSubmitted: number;
  applicationsAccepted: number;
  matchScore: number;
  rank: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  contactEmail?: string;
  phone?: string;
  timezone?: string;
  preferredCategories: string[];
  preferredTechnologies: string[];
  salaryExpectations?: string;
  workStyle: 'team' | 'individual' | 'both';
  communicationStyle: 'formal' | 'casual' | 'mixed';
}

export interface UseNetworkingProfileReturn {
  profile: NetworkingProfile | null;
  loading: boolean;
  error: string | null;
  createProfile: (profileData: Partial<NetworkingProfile>) => Promise<void>;
  updateProfile: (profileData: Partial<NetworkingProfile>) => Promise<void>;
  refresh: () => Promise<void>;
}

// Empty mock profile - no mock data
const mockProfile: NetworkingProfile | null = null;

export const useNetworkingProfile = (userId: string | undefined): UseNetworkingProfileReturn => {
  const [profile, setProfile] = useState<NetworkingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const loadProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (useMockData) {
        setProfile(mockProfile);
        setLoading(false);
        return;
      }

      const docRef = doc(db, 'networkingProfiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as NetworkingProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Ошибка загрузки профиля');
      
      // Fallback to mock data
      if (!useMockData) {
        setUseMockData(true);
        setProfile(mockProfile);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<NetworkingProfile>) => {
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setError(null);

      if (useMockData) {
        const newProfile: NetworkingProfile = {
          id: userId,
          userId,
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          role: profileData.role || 'developer',
          skills: profileData.skills || [],
          interests: profileData.interests || [],
          experience: profileData.experience || 'entry',
          location: profileData.location || '',
          isRemote: profileData.isRemote || false,
          availability: profileData.availability || 'project-based',
          education: profileData.education || '',
          languages: profileData.languages || ['Қазақша'],
          achievements: profileData.achievements || [],
          projectsCreated: 0,
          projectsJoined: 0,
          applicationsSubmitted: 0,
          applicationsAccepted: 0,
          matchScore: 0,
          rank: 'Жаңа пайдаланушы',
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: true,
          preferredCategories: profileData.preferredCategories || [],
          preferredTechnologies: profileData.preferredTechnologies || [],
          workStyle: profileData.workStyle || 'both',
          communicationStyle: profileData.communicationStyle || 'mixed',
          ...profileData,
        };
        setProfile(newProfile);
        return;
      }

      const newProfile: NetworkingProfile = {
        id: userId,
        userId,
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        role: profileData.role || 'developer',
        skills: profileData.skills || [],
        interests: profileData.interests || [],
        experience: profileData.experience || 'entry',
        location: profileData.location || '',
        isRemote: profileData.isRemote || false,
        availability: profileData.availability || 'project-based',
        education: profileData.education || '',
        languages: profileData.languages || ['Русский'],
        achievements: profileData.achievements || [],
        projectsCreated: 0,
        projectsJoined: 0,
        applicationsSubmitted: 0,
        applicationsAccepted: 0,
        matchScore: 0,
        rank: 'Новичок',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        preferredCategories: profileData.preferredCategories || [],
        preferredTechnologies: profileData.preferredTechnologies || [],
        workStyle: profileData.workStyle || 'both',
        communicationStyle: profileData.communicationStyle || 'mixed',
        ...profileData,
      };

      const docRef = doc(db, 'networkingProfiles', userId);
      await setDoc(docRef, newProfile);

      setProfile(newProfile);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Ошибка создания профиля');
      throw err;
    }
  };

  const updateProfile = async (profileData: Partial<NetworkingProfile>) => {
    if (!userId || !profile) {
      throw new Error('Профиль не найден');
    }

    try {
      setError(null);

      if (useMockData) {
        const updatedProfile = { ...profile, ...profileData, updatedAt: new Date() };
        setProfile(updatedProfile);
        return;
      }

      const updatedData = {
        ...profileData,
        updatedAt: new Date(),
      };

      const docRef = doc(db, 'networkingProfiles', userId);
      await updateDoc(docRef, updatedData);

      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Ошибка обновления профиля');
      throw err;
    }
  };

  const refresh = async () => {
    await loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, [userId, useMockData]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refresh,
  };
}; 