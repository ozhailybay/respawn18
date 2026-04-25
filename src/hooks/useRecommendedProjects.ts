import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { collection, query, orderBy, limit as firestoreLimit, getDocs, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import { Connect6MatchRequest, Connect6MatchResult } from '../types';
import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

// Интерфейс для данных рекомендованного проекта
export interface RecommendedProject {
  id: string;
  projectId: string;
  score: number;
  reasonTags?: string[];
  factorScores?: {
    skills: number;
    interests: number;
    experience: number;
    mode: number;
    availability: number;
    teamFit: number;
  };
  matchType?: string;
  createdAt?: any;
  matchedAt?: any;
  
  // Данные проекта
  projectData?: {
    title: string;
    description: string;
    tags: string[];
    skillsNeeded: string[];
    mode: string;
    ownerUid: string;
    ownerName?: string;
    ownerAvatar?: string;
    teamSize: number;
    isOpen: boolean;
  };
}

interface RecommendedProjectsFilters {
  tags?: string[];
  skills?: string[];
  mode?: 'remote' | 'onsite' | 'hybrid' | 'all';
  teamSizeRange?: [number, number];
  onlyOpen?: boolean;
}

interface UseRecommendedProjectsOptions {
  limit?: number;
  filters?: RecommendedProjectsFilters;
}

interface UseRecommendedProjectsParams {
  userId: string;
  options?: UseRecommendedProjectsOptions;
  queryOptions?: UseQueryOptions<RecommendedProject[], Error>;
}

/**
 * Hook to get recommended projects using the Connect-6 matching system
 */
export function useRecommendedProjects({
  userId,
  options = {},
  queryOptions
}: UseRecommendedProjectsParams) {
  const { limit = 10, filters } = options;
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // Call the Connect-6 matching function
  const triggerConnect6Match = useCallback(async () => {
    try {
      const connect6MatchFn = httpsCallable<Connect6MatchRequest, { matches: Connect6MatchResult[] }>(
        functions, 
        'connect6Match'
      );
      
      const matchRequest: Connect6MatchRequest = {
        userId,
        filters: {
          tags: filters?.tags,
          skills: filters?.skills,
          mode: filters?.mode,
          teamSizeRange: filters?.teamSizeRange,
          onlyOpen: filters?.onlyOpen !== false // Default to true if not specified
        },
        limit
      };
      
      const result = await connect6MatchFn(matchRequest);
      return result.data.matches;
    } catch (error) {
      console.error('Error triggering Connect-6 match:', error);
      throw error;
    }
  }, [userId, filters, limit]);
  
  // Mutation to trigger matching
  const matchMutation = useMutation({
    mutationFn: triggerConnect6Match,
    onSuccess: (data) => {
      // Update the query cache with new recommendations
      queryClient.setQueryData(['recommendedProjects', userId, limit, filters], data);
    },
    onError: (error) => {
      toast({
        title: 'Error getting recommendations',
        description: 'Could not calculate project recommendations. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Match mutation error:', error);
    }
  });
  
  // Process match results to include project data
  const processMatches = async (matches: Connect6MatchResult[]): Promise<RecommendedProject[]> => {
    if (!matches.length) {
      return [];
    }
    
    // Fetch project data for each match
    const projectPromises = matches.map(async (matchData) => {
      // Get project data
      const projectRef = doc(db, `projects/${matchData.projectId}`);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        console.warn(`Project ${matchData.projectId} not found`);
        return null;
      }
      
      const projectData = projectSnap.data();
      
      // Get owner data
      let ownerName = 'Unknown User';
      let ownerAvatar = '';
      
      if (projectData?.ownerUid) {
        const ownerRef = doc(db, `users/${projectData.ownerUid}`);
        const ownerSnap = await getDoc(ownerRef);
        
        if (ownerSnap.exists()) {
          const ownerData = ownerSnap.data();
          ownerName = ownerData?.displayName || 'Unknown User';
          ownerAvatar = ownerData?.photoURL || '';
        }
      }
      
      // Apply client-side filters if provided
      if (filters) {
        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
          const projectTags = projectData?.tags || [];
          if (!filters.tags.some(tag => projectTags.includes(tag))) {
            return null;
          }
        }
        
        // Filter by skills
        if (filters.skills && filters.skills.length > 0) {
          const projectSkills = projectData?.skillsNeeded || [];
          if (!filters.skills.some(skill => projectSkills.includes(skill))) {
            return null;
          }
        }
        
        // Filter by mode
        if (filters.mode && filters.mode !== 'all') {
          if (projectData?.mode !== filters.mode) {
            return null;
          }
        }
        
        // Filter by team size
        if (filters.teamSizeRange) {
          const [min, max] = filters.teamSizeRange;
          if (projectData?.teamSize < min || projectData?.teamSize > max) {
            return null;
          }
        }
        
        // Filter by open status
        if (filters.onlyOpen !== undefined) {
          if (projectData?.isOpen !== filters.onlyOpen) {
            return null;
          }
        }
      }
      
      return {
        id: matchData.projectId,
        projectId: matchData.projectId,
        score: matchData.score,
        reasonTags: matchData.reasonTags || [],
        factorScores: matchData.factorScores,
        matchedAt: matchData.matchedAt,
        projectData: {
          ...projectData,
          ownerName,
          ownerAvatar
        }
      };
    });
    
    const resolvedProjects = await Promise.all(projectPromises);
    return resolvedProjects.filter(Boolean) as RecommendedProject[];
  };
  
  // Query to get recommended projects
  const recommendationsQuery = useQuery({
    queryKey: ['recommendedProjects', userId, limit, filters],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        // First try to get from Firestore
        const matchesRef = collection(db, 'matches', userId, 'recommendations');
        const matchesQuery = query(
          matchesRef,
          orderBy('score', 'desc'),
          firestoreLimit(limit)
        );
        
        const matchesSnapshot = await getDocs(matchesQuery);
        
        // If no recommendations found or they're outdated, trigger Connect-6 matching
        if (matchesSnapshot.empty) {
          const newMatches = await triggerConnect6Match();
          return processMatches(newMatches);
        }
        
        // Otherwise, process existing recommendations
        const matchDocuments = matchesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Connect6MatchResult[];
        
        return processMatches(matchDocuments);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
    enabled: !!userId,
    ...queryOptions,
  });
  
  // Return both the query and the mutation
  return {
    ...recommendationsQuery,
    refreshMatches: matchMutation.mutate,
    isRefreshing: matchMutation.isPending
  };
} 