import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  collection,
  getDocs,
  onSnapshot,
  FirestoreError,
  query,
  limit
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import { 
  getFunctions, 
  connectFunctionsEmulator 
} from 'firebase/functions';

console.log('🔥 Firebase initialization starting...');

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config:', firebaseConfig);

// Validate configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}`);
}

// Retry wrapper for Firestore operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (error instanceof FirestoreError) {
        console.error(`Firebase operation failed (attempt ${attempt}/${maxRetries}):`, {
          code: error.code,
          message: error.message
        });
        
        // Don't retry on certain errors
        if (['permission-denied', 'unauthenticated'].includes(error.code)) {
          throw error;
        }
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Initialize Firebase with error handling
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: any;
let functions: any;

const initializeFirebaseServices = async () => {
try {
  // Initialize Firebase app
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Initialize Firebase services
  console.log('Initializing Firebase services...');
  
  // Initialize Auth
  auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);
  console.log('✅ Firebase Auth initialized successfully');
  
  // Initialize Firestore with new cache API
  console.log('Initializing Firestore...');
  try {
    console.log('Attempt 1 to initialize Firestore...');
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('✅ Firebase Firestore initialized successfully');
    
    // Test Firestore connection
    const testCollection = collection(db, 'posts');
    console.log('Test collection reference created for \'posts\' collection');
    
  } catch (firestoreError) {
    console.warn('Failed to initialize Firestore with cache, falling back to default:', firestoreError);
    db = getFirestore(app);
    console.log('✅ Firebase Firestore initialized with fallback');
  }
  
  // Initialize Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized successfully');
  
  // Initialize Functions
  functions = getFunctions(app);
  console.log('✅ Firebase Functions initialized successfully');
    
    console.log('🔥 All Firebase services initialized');
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Initialize Firebase immediately but handle async properly
try {
  // Initialize Firebase app (synchronous)
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Initialize Auth (synchronous)
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
  
  // Initialize Firestore with fallback (synchronous)
  console.log('Initializing Firestore...');
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('✅ Firebase Firestore initialized successfully');
  } catch (firestoreError) {
    console.warn('Failed to initialize Firestore with cache, falling back to default:', firestoreError);
    db = getFirestore(app);
    console.log('✅ Firebase Firestore initialized with fallback');
  }
  
  // Initialize Storage (synchronous)
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized successfully');
  
  // Initialize Functions (synchronous)
  functions = getFunctions(app);
  console.log('✅ Firebase Functions initialized successfully');
  
  // Set persistence asynchronously
  setPersistence(auth, browserLocalPersistence).then(() => {
    console.log('✅ Firebase Auth persistence set successfully');
  }).catch((error) => {
    console.warn('Failed to set auth persistence:', error);
  });
  
  console.log('🔥 All Firebase services initialized');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Enhanced Firestore operations with retry logic
export const firestoreOperations = {
  async getCollection(collectionName: string) {
    return withRetry(async () => {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  },
  
  async subscribeToCollection(
    collectionName: string, 
    callback: (data: any[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );
  }
};

// Connection diagnostics
export const diagnostics = {
  async checkFirebaseConnection(): Promise<{
    status: 'connected' | 'error';
    details: string;
    recommendations?: string[];
  }> {
    try {
      // Test basic Firestore connection
      const testCollection = collection(db, 'posts');
      const testQuery = query(testCollection, limit(1));
      
      const startTime = Date.now();
      await getDocs(testQuery);
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 5000) {
        return {
          status: 'connected',
          details: `Connection established but slow (${responseTime}ms)`,
          recommendations: [
            'Check your internet connection',
            'Consider using Firebase emulator for development',
            'Verify Firebase project configuration'
          ]
        };
      }
      
      return {
        status: 'connected',
        details: `Connection successful (${responseTime}ms)`
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error occurred';
      let recommendations: string[] = [];
      
      if (error instanceof FirestoreError) {
        errorMessage = `${error.code}: ${error.message}`;
        
        switch (error.code) {
          case 'permission-denied':
            recommendations = [
              'Check Firestore security rules',
              'Ensure user is properly authenticated',
              'Verify collection permissions'
            ];
            break;
          case 'unavailable':
            recommendations = [
              'Check internet connection',
              'Verify Firebase project is active',
              'Try again in a few moments'
            ];
            break;
          default:
            recommendations = [
              'Check Firebase configuration',
              'Verify project settings',
              'Check console for detailed errors'
            ];
        }
      }
      
      return {
        status: 'error',
        details: errorMessage,
        recommendations
      };
    }
  },

  async testAuthState(): Promise<{
    status: 'authenticated' | 'unauthenticated';
    details: string;
  }> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        unsubscribe();
        if (user) {
          resolve({
            status: 'authenticated',
            details: `User authenticated: ${user.email || user.uid}`
          });
        } else {
          resolve({
            status: 'unauthenticated',
            details: 'No user is currently signed in'
          });
        }
      });
    });
  },

  async runFullDiagnostics() {
    console.log('🔍 Running Firebase diagnostics...');
    
    const [connectionResult, authResult] = await Promise.all([
      this.checkFirebaseConnection(),
      this.testAuthState()
    ]);
    
    console.log('📡 Connection Status:', connectionResult);
    console.log('🔐 Auth Status:', authResult);
    
    return { connectionResult, authResult };
  }
};

// Export getDb function for compatibility with existing code
export const getDb = async (): Promise<Firestore> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

// Export all Firebase services
export { auth, db, storage, functions };

export default app;

