import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
// Fix the import for Redis
const Redis = require('ioredis');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Google Generative AI client
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Initialize Redis client if REDIS_URL is provided
const REDIS_URL = process.env.REDIS_URL;
const redisClient = REDIS_URL ? new Redis(REDIS_URL) : null;

// Redis cache TTL (24 hours)
const CACHE_TTL = 24 * 60 * 60;

// Factor weights for scoring
const FACTOR_WEIGHTS = {
  skills: 0.35,
  interests: 0.15,
  experience: 0.15,
  mode: 0.10,
  availability: 0.10,
  teamFit: 0.15,
};

interface Connect6FactorScores {
  skills: number;
  interests: number;
  experience: number;
  mode: number;
  availability: number;
  teamFit: number;
}

interface Connect6MatchResult {
  projectId: string;
  score: number;
  reasonTags: string[];
  factorScores: Connect6FactorScores;
  matchedAt: admin.firestore.Timestamp;
}

interface Connect6MatchRequest {
  userId: string;
  filters?: {
    tags?: string[];
    skills?: string[];
    mode?: 'remote' | 'onsite' | 'hybrid' | 'all';
    teamSizeRange?: [number, number];
    onlyOpen?: boolean;
  };
  limit?: number;
}

// Define types for project and user data
interface UserSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
}

interface UserExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements?: string[];
}

interface ProjectData {
  title: string;
  description: string;
  tags: string[];
  skillsNeeded: string[];
  teamSize: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mode: 'remote' | 'onsite' | 'hybrid';
  isOpen: boolean;
  ownerUid: string;
  ownerName?: string;
}

/**
 * Get or cache embedding from Google Gemini
 */
async function getOrCacheEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    return Array(768).fill(0); // Return zero vector for empty text (Gemini embedding size)
  }

  const cacheKey = `embedding:${Buffer.from(text).toString('base64')}`;

  // Try to get from cache if Redis is available
  if (redisClient) {
    const cachedEmbedding = await redisClient.get(cacheKey);
    if (cachedEmbedding) {
      return JSON.parse(cachedEmbedding);
    }
  }

  // Generate new embedding from Google Gemini
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embeddingModel.embedContent(text.slice(0, 8000)); // Gemini also has token limits
    const embedding = result.embedding.values;

    // Cache the embedding if Redis is available
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(embedding), 'EX', CACHE_TTL);
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new HttpsError('internal', 'Failed to generate text embedding');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate match score between user and project
 */
async function calculateMatchScore(
  userData: admin.firestore.DocumentData,
  projectData: admin.firestore.DocumentData,
): Promise<{ score: number; factorScores: Connect6FactorScores; reasonTags: string[] }> {
  const factorScores: Connect6FactorScores = {
    skills: 0,
    interests: 0,
    experience: 0,
    mode: 0,
    availability: 0,
    teamFit: 0,
  };

  const reasonTags: string[] = [];

  // 1. Skills match (35%)
  const userSkills = userData.skills?.map((s: UserSkill | string) => typeof s === 'string' ? s : s.name) || [];
  const projectSkills = projectData.skillsNeeded || [];
  
  if (userSkills.length > 0 && projectSkills.length > 0) {
    // Get embeddings for user skills and project skills
    const userSkillsText = userSkills.join(', ');
    const projectSkillsText = projectSkills.join(', ');
    
    const userSkillsEmbedding = await getOrCacheEmbedding(userSkillsText);
    const projectSkillsEmbedding = await getOrCacheEmbedding(projectSkillsText);
    
    // Calculate cosine similarity
    const skillSimilarity = cosineSimilarity(userSkillsEmbedding, projectSkillsEmbedding);
    factorScores.skills = skillSimilarity;
    
    // Add bonus if more than 80% of skills match directly
    const directMatches = projectSkills.filter((skill: string) => 
      userSkills.some((userSkill: string) => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length;
    
    const matchPercentage = projectSkills.length > 0 
      ? directMatches / projectSkills.length 
      : 0;
    
    if (matchPercentage >= 0.8) {
      factorScores.skills += 0.05;
      reasonTags.push('strong_skill_match');
    }
    
    if (factorScores.skills > 0.7) {
      reasonTags.push('skills_aligned');
    }
  }
  
  // 2. Interests match (15%)
  const userInterests = userData.interests || [];
  const projectTags = projectData.tags || [];
  
  if (userInterests.length > 0 && projectTags.length > 0) {
    const userInterestsText = userInterests.join(', ');
    const projectTagsText = projectTags.join(', ');
    
    const userInterestsEmbedding = await getOrCacheEmbedding(userInterestsText);
    const projectTagsEmbedding = await getOrCacheEmbedding(projectTagsText);
    
    factorScores.interests = cosineSimilarity(userInterestsEmbedding, projectTagsEmbedding);
    
    if (factorScores.interests > 0.6) {
      reasonTags.push('interests_aligned');
    }
  }
  
  // 3. Experience/Level match (15%)
  const userExperience = userData.experience || [];
  const userExperienceYears = userExperience.reduce((total: number, exp: UserExperience) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.current ? new Date() : new Date(exp.endDate || new Date());
    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);
  
  // Normalize experience to 0-1 range (0-10 years)
  const normalizedUserExperience = Math.min(userExperienceYears / 10, 1);
  
  // Project difficulty or required experience level (assuming it's normalized to 0-1)
  const projectDifficulty = (projectData.difficulty === 'beginner' ? 0.3 : 
                            projectData.difficulty === 'intermediate' ? 0.6 : 
                            projectData.difficulty === 'advanced' ? 0.9 : 0.5);
  
  // Calculate experience match as 1 - absolute difference
  factorScores.experience = 1 - Math.abs(normalizedUserExperience - projectDifficulty);
  
  // Penalty if project is way above user's experience
  if (projectDifficulty > normalizedUserExperience + 0.2) {
    factorScores.experience -= 0.05;
    reasonTags.push('experience_gap');
  } else if (normalizedUserExperience > projectDifficulty + 0.3) {
    reasonTags.push('overqualified');
  } else {
    reasonTags.push('experience_match');
  }
  
  // 4. Work Mode match (10%)
  const userPreferredMode = userData.workPreferences?.remotePreference || 'all';
  const projectMode = projectData.mode || 'remote';
  
  if (userPreferredMode === 'all' || userPreferredMode === projectMode) {
    factorScores.mode = 1.0;
    reasonTags.push('mode_match');
  } else {
    factorScores.mode = 0.0;
  }
  
  // 5. Availability/Timezone (10%)
  // Simple implementation for MVP - can be enhanced with actual timezone calculations
  factorScores.availability = 0.8; // Default good availability score
  reasonTags.push('timezone_compatible');
  
  // 6. Team-fit metrics (15%)
  const userTeamSizePreference = userData.workPreferences?.teamSizePreference || [2, 10];
  const projectTeamSize = projectData.teamSize || 1;
  
  if (projectTeamSize >= userTeamSizePreference[0] && projectTeamSize <= userTeamSizePreference[1]) {
    factorScores.teamFit = 1.0;
    reasonTags.push('team_size_match');
  } else {
    // Partial score based on how close it is to preferred range
    const distanceToRange = Math.min(
      Math.abs(projectTeamSize - userTeamSizePreference[0]),
      Math.abs(projectTeamSize - userTeamSizePreference[1])
    );
    factorScores.teamFit = Math.max(0, 1 - (distanceToRange / 5)); // Normalize by 5
  }
  
  if (projectData.isOpen) {
    factorScores.teamFit += 0.07;
    reasonTags.push('project_open_for_applications');
  }
  
  // Calculate final weighted score
  const finalScore = Object.entries(FACTOR_WEIGHTS).reduce((score, [factor, weight]) => {
    return score + (factorScores[factor as keyof Connect6FactorScores] * weight);
  }, 0);
  
  // Normalize to 0-100 range
  const normalizedScore = Math.round(Math.max(0, Math.min(1, finalScore)) * 100);
  
  // Fix the spread operation
  const uniqueReasonTags = Array.from(new Set(reasonTags));
  
  return { 
    score: normalizedScore, 
    factorScores, 
    reasonTags: uniqueReasonTags // Remove duplicates
  };
}

/**
 * Rerank results to increase diversity
 */
function diversifyResults(matches: Connect6MatchResult[]): Connect6MatchResult[] {
  // Simple diversification: ensure projects with different tags are represented
  const projectsByTag: Record<string, Connect6MatchResult[]> = {};
  
  // Group projects by tags
  matches.forEach(match => {
    const project = match as Connect6MatchResult & { tags?: string[] };
    if (project.tags) {
      project.tags.forEach(tag => {
        if (!projectsByTag[tag]) {
          projectsByTag[tag] = [];
        }
        projectsByTag[tag].push(match);
      });
    }
  });
  
  // Take top project from each tag group
  const diversifiedResults = new Set<Connect6MatchResult>();
  Object.values(projectsByTag).forEach(tagProjects => {
    tagProjects.sort((a, b) => b.score - a.score);
    if (tagProjects[0]) {
      diversifiedResults.add(tagProjects[0]);
    }
  });
  
  // Add remaining projects sorted by score until we reach original length
  const remainingProjects = matches.filter(match => !diversifiedResults.has(match))
    .sort((a, b) => b.score - a.score);
  
  // Fix the spread operation
  const result = Array.from(diversifiedResults);
  let i = 0;
  while (result.length < matches.length && i < remainingProjects.length) {
    result.push(remainingProjects[i]);
    i++;
  }
  
  // Final sort by score
  return result.sort((a, b) => b.score - a.score);
}

/**
 * Connect-6 Matching Cloud Function
 */
export const connect6Match = onCall<Connect6MatchRequest>(async (request) => {
  const startTime = Date.now();

  // Check if the user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to use matching');
  }

  const { userId, filters = {}, limit = 10 } = request.data;
  
  // Verify the userId belongs to the authenticated user or user is admin
  if (userId !== request.auth.uid) {
    // Check if user is admin
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new HttpsError(
        'permission-denied',
        'You can only request matches for your own profile'
      );
    }
  }
  
  try {
    // 1. Get user profile data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }
    
    const userData = userDoc.data()!;
    
    // 2. Query candidate projects with composite index
    let projectsQuery = db.collection('projects')
      .where('isOpen', '==', filters.onlyOpen === false ? false : true);
    
    // Apply mode filter if specified
    if (filters.mode && filters.mode !== 'all') {
      projectsQuery = projectsQuery.where('mode', '==', filters.mode);
    }
    
    // Apply tags filter if specified (using array-contains-any for first tag)
    if (filters.tags && filters.tags.length > 0) {
      projectsQuery = projectsQuery.where('tags', 'array-contains-any', filters.tags.slice(0, 10));
    }
    
    // Get projects
    const projectsSnapshot = await projectsQuery.limit(50).get();
    
    if (projectsSnapshot.empty) {
      return { matches: [] };
    }
    
    // 3. Score each project
    const scoringPromises = projectsSnapshot.docs.map(async (projectDoc) => {
      const projectData = projectDoc.data();
      
      // Skip projects owned by the user
      if (projectData.ownerUid === userId) {
        return null;
      }
      
      // Skip projects that don't match additional tag filters (for tags beyond first 10)
      if (filters.tags && filters.tags.length > 0) {
        const projectTags = projectData.tags || [];
        
        // For frontend filtering with array-contains-any limitation
        if (filters.tags.length > 10) {
          const hasAnyRequiredTag = filters.tags.slice(10).some(tag => 
            projectTags.includes(tag)
          );
          
          if (!hasAnyRequiredTag) {
            return null;
          }
        }
      }
      
      // Skip projects that don't match skills filter
      if (filters.skills && filters.skills.length > 0) {
        const projectSkills = projectData.skillsNeeded || [];
        const hasAnyRequiredSkill = filters.skills.some(skill => 
          projectSkills.includes(skill)
        );
        
        if (!hasAnyRequiredSkill) {
          return null;
        }
      }
      
      // Calculate match score
      const { score, factorScores, reasonTags } = await calculateMatchScore(userData, projectData);
      
      return {
        projectId: projectDoc.id,
        score,
        factorScores,
        reasonTags,
        matchedAt: admin.firestore.Timestamp.now(),
        // Additional metadata for filtering
        tags: projectData.tags,
      };
    });
    
    const scoredProjects = (await Promise.all(scoringPromises))
      .filter(Boolean) as Connect6MatchResult[];
    
    // 4. Sort by score and apply diversity reranking
    let sortedMatches = scoredProjects.sort((a, b) => b.score - a.score);
    
    // Apply diversity reranking
    const diversifiedMatches = diversifyResults(sortedMatches);
    
    // Take top N results
    const topMatches = diversifiedMatches.slice(0, limit);
    
    // 5. Save to Firestore
    const matchesRef = db.collection('matches').doc(userId);
    const batch = db.batch();
    
    // Create recommendations subcollection with batch write
    topMatches.forEach((match) => {
      const { tags, ...matchData } = match as any; // Remove tags used for diversification
      const docRef = matchesRef.collection('recommendations').doc(match.projectId);
      batch.set(docRef, matchData);
    });
    
    // Update metadata
    batch.set(matchesRef, {
      lastUpdated: admin.firestore.Timestamp.now(),
      userId,
      filtersApplied: filters,
    }, { merge: true });
    
    await batch.commit();
    
    // Calculate latency
    const latencyMs = Date.now() - startTime;
    
    // Return results
    return {
      matches: topMatches,
      latencyMs,
      matchCount: topMatches.length,
    };
  } catch (error) {
    console.error('Error in connect6Match:', error);
    throw new HttpsError('internal', 'Failed to compute matches');
  }
});

/**
 * Connect-6 Match Explanation Cloud Function
 */
export const connect6MatchExplain = onCall(async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, projectId } = request.data;
  
  // Verify the userId belongs to the authenticated user or user is admin
  if (userId !== request.auth.uid) {
    // Check if user is admin
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new HttpsError(
        'permission-denied',
        'You can only request explanations for your own matches'
      );
    }
  }
  
  try {
    // Get the match data
    const matchDoc = await db.collection('matches')
      .doc(userId)
      .collection('recommendations')
      .doc(projectId)
      .get();
    
    if (!matchDoc.exists) {
      throw new HttpsError('not-found', 'Match not found');
    }
    
    const matchData = matchDoc.data()!;
    
    // Get user and project data for detailed explanation
    const [userDoc, projectDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('projects').doc(projectId).get()
    ]);
    
    if (!userDoc.exists || !projectDoc.exists) {
      throw new HttpsError('not-found', 'User or project not found');
    }
    
    const userData = userDoc.data()!;
    const projectData = projectDoc.data()!;
    
    // Determine which factors were matched
    const factorScores = matchData.factorScores || {};
    const matchedFactors: string[] = [];
    const unmatchedFactors: string[] = [];
    
    for (const [factor, score] of Object.entries(factorScores)) {
      if ((score as number) >= 0.7) {
        matchedFactors.push(factor);
      } else if ((score as number) <= 0.3) {
        unmatchedFactors.push(factor);
      }
    }
    
    // Determine matched skills
    const userSkills = userData.skills?.map((s: UserSkill | string) => typeof s === 'string' ? s : s.name) || [];
    const projectSkills = projectData.skillsNeeded || [];
    const skillsMatched = projectSkills.filter((skill: string) => 
      userSkills.some((userSkill: string) => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    // Determine matched interests
    const userInterests = userData.interests || [];
    const projectTags = projectData.tags || [];
    const interestsMatched = projectTags.filter((tag: string) => 
      userInterests.some((interest: string) => interest.toLowerCase() === tag.toLowerCase())
    );
    
    // Generate detailed explanations
    const reasonDetails: Record<string, string> = {};
    
    if (factorScores.skills >= 0.7) {
      reasonDetails.skills = `Your skills match ${skillsMatched.length} of ${projectSkills.length} required skills for this project.`;
    } else {
      reasonDetails.skills = `You match fewer than half of the required skills for this project.`;
    }
    
    if (factorScores.interests >= 0.6) {
      reasonDetails.interests = `Your interests align well with this project's focus areas.`;
    } else {
      reasonDetails.interests = `This project's focus areas differ from your stated interests.`;
    }
    
    if (factorScores.mode >= 0.9) {
      reasonDetails.mode = `This project's ${projectData.mode} work mode matches your preference.`;
    } else {
      reasonDetails.mode = `This project's ${projectData.mode} work mode differs from your preference.`;
    }
    
    if (factorScores.teamFit >= 0.8) {
      reasonDetails.teamFit = `The team size (${projectData.teamSize}) matches your preferred range.`;
    }
    
    return {
      projectId,
      factorScores,
      matchedFactors,
      unmatchedFactors,
      skillsMatched,
      interestsMatched,
      reasonDetails,
      matchScore: matchData.score,
      matchedAt: matchData.matchedAt,
    };
  } catch (error) {
    console.error('Error in connect6MatchExplain:', error);
    throw new HttpsError('internal', 'Failed to explain match');
  }
});

/**
 * Batch Update Connect-6 Matches (Admin Only)
 */
export const connect6BatchUpdate = onCall(async (request) => {
  // Check if the user is authenticated and is admin
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  const userData = userDoc.data();
  
  if (!userData || userData.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can trigger batch updates');
  }
  
  const { userIds, filters } = request.data;
  
  try {
    // Get all users if userIds not provided
    let targetUserIds = userIds;
    
    if (!targetUserIds || !targetUserIds.length) {
      const usersSnapshot = await db.collection('users').limit(100).get();
      targetUserIds = usersSnapshot.docs.map(doc => doc.id);
    }
    
    // Use Firestore to schedule batch updates instead of pubsub
    const batchUpdateRef = db.collection('connect6-batch-updates').doc();
    await batchUpdateRef.set({
      userIds: targetUserIds,
      filters,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
      completedCount: 0,
      totalCount: targetUserIds.length
    });
    
    // Create individual update tasks
    const batch = db.batch();
    targetUserIds.forEach((userId: string) => {
      const updateRef = db.collection('connect6-update-tasks').doc();
      batch.set(updateRef, {
        userId,
        filters,
        batchId: batchUpdateRef.id,
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now()
      });
    });
    
    await batch.commit();
    
    return {
      status: 'success',
      usersScheduled: targetUserIds.length,
      batchId: batchUpdateRef.id
    };
  } catch (error) {
    console.error('Error in connect6BatchUpdate:', error);
    throw new HttpsError('internal', 'Failed to schedule batch updates');
  }
}); 