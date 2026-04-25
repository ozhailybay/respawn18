import { collection, addDoc, updateDoc, deleteDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../hooks/useProjects';

export interface CreateProjectData {
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
  budget?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  benefits: string[];
  isRemote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior';
  projectType: 'personal' | 'commercial' | 'open-source' | 'research';
  requirements?: string;
  goals?: string;
  timeline?: string;
}

export const projectService = {
  async createProject(projectData: CreateProjectData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        views: 0,
        applications: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Не удалось создать проект');
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Не удалось обновить проект');
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, 'projects', projectId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Не удалось удалить проект');
    }
  },

  async incrementViews(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        views: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  async incrementApplications(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        applications: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing applications:', error);
    }
  },
}; 