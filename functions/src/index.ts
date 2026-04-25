import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { connect6Match, connect6MatchExplain, connect6BatchUpdate } from './connect6Match';
import { analyzeResume, generateResumeContent } from './resumeAnalysis';
import { generateResumeWithGemini, matchJobsWithGemini, analyzeSkillsWithGemini } from './gemini';
import { onUserCreate, onUserDelete, migrateExistingUsers } from './userManagement';

// Initialize Firebase Admin
admin.initializeApp();

// Export Connect-6 matching functions
export { connect6Match, connect6MatchExplain, connect6BatchUpdate };

// Export resume analysis functions
export { analyzeResume, generateResumeContent };

// Export Gemini AI functions
export { generateResumeWithGemini, matchJobsWithGemini, analyzeSkillsWithGemini };

// Export user management functions
export { onUserCreate, onUserDelete, migrateExistingUsers };

// Cloud Function для автоматического создания пользователей в Firestore (обновленная версия)
export const createUserDocument = functions.auth.user().onCreate(async (user: any) => {
  try {
    console.log(`🆕 Creating user document for ${user.uid}`);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Пользователь',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      role: 'student',
      isBlocked: false,
      profileCompleted: false,
      // Базовые поля профиля
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      phoneNumber: user.phoneNumber || '',
      location: '',
      bio: '',
      position: '',
      education: [],
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      // Метаданные
      emailVerified: user.emailVerified,
      authProvider: user.providerData[0]?.providerId || 'email',
      providerData: user.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        uid: provider.uid,
        displayName: provider.displayName,
        email: provider.email,
        photoURL: provider.photoURL
      })),
      // Настройки
      preferences: {
        jobAlerts: true,
        emailNotifications: true,
        pushNotifications: true
      },
      // Статистика
      stats: {
        applicationsSubmitted: 0,
        projectsCompleted: 0,
        coursesCompleted: 0,
        connectionsMade: 0
      }
    };

    await admin.firestore().collection('users').doc(user.uid).set(userData);
    console.log(`✅ Successfully created user document for ${user.uid}`);
  } catch (error) {
    console.error(`❌ Error creating user document for ${user.uid}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to create user document');
  }
});

 