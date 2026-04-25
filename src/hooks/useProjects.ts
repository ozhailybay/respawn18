import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'recruiting' | 'completed' | 'paused';
  author: string;
  authorId: string;
  authorRole?: string;
  authorAvatar?: string;
  tags: string[];
  teamSize: string;
  duration: string;
  location: string;
  matchScore?: number;
  budget?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  applications: number;
  isRemote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior';
  projectType: 'personal' | 'commercial' | 'open-source' | 'research';
}

export interface ProjectFilters {
  search?: string;
  categories?: string[];
  locations?: string[];
  teamSizes?: string[];
  durations?: string[];
  difficulties?: string[];
  minMatchScore?: number;
  maxBudget?: number;
  technologies?: string[];
  status?: string[];
  sortBy?: 'relevance' | 'date' | 'matchScore' | 'budget' | 'views';
  sortOrder?: 'asc' | 'desc';
  isRemote?: boolean;
  experienceLevel?: string[];
  projectType?: string[];
}

export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
}

const PROJECTS_PER_PAGE = 12;

// Empty array - no mock data
const mockProjects: Project[] = [];

export const useProjects = (initialFilters: ProjectFilters = {}): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters);
  const [useMockData, setUseMockData] = useState(false);

  const buildQuery = (isLoadMore = false) => {
    let q = query(collection(db, 'projects'));

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      q = query(q, where('status', 'in', filters.status));
    }

    if (filters.categories && filters.categories.length > 0) {
      q = query(q, where('category', 'in', filters.categories));
    }

    if (filters.isRemote !== undefined) {
      q = query(q, where('isRemote', '==', filters.isRemote));
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      q = query(q, where('experienceLevel', 'in', filters.experienceLevel));
    }

    if (filters.projectType && filters.projectType.length > 0) {
      q = query(q, where('projectType', 'in', filters.projectType));
    }

    // Sort
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    q = query(q, orderBy(sortField, sortOrder));

    // Pagination
    q = query(q, limit(PROJECTS_PER_PAGE));

    if (isLoadMore && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return q;
  };

  const loadProjects = async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      if (useMockData) {
        // Use mock data
        const newProjects = mockProjects;
        if (isLoadMore) {
          setProjects(prev => [...prev, ...newProjects]);
        } else {
          setProjects(newProjects);
        }
        setHasMore(false);
        return;
      }

      const q = buildQuery(isLoadMore);
      const querySnapshot = await getDocs(q);

      const newProjects: Project[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Project[];

      if (isLoadMore) {
        setProjects(prev => [...prev, ...newProjects]);
      } else {
        setProjects(newProjects);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === PROJECTS_PER_PAGE);

    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Ошибка загрузки проектов');
      
      // Fallback to mock data
      if (!useMockData) {
        setUseMockData(true);
        setProjects(mockProjects);
        setHasMore(false);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await loadProjects(true);
  };

  const refresh = async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadProjects(false);
  };

  useEffect(() => {
    loadProjects(false);
  }, [filters, useMockData]);

  return {
    projects,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    filters,
    setFilters,
  };
}; 