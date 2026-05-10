import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import fallbackConfig from '../../firebase-applet-config.json';

const getCleanVal = (envVal: any, fallbackVal: string) => {
  if (!envVal || typeof envVal !== 'string') return fallbackVal;
  const cleanVal = envVal.trim();
  if (cleanVal === '' || cleanVal === 'undefined' || cleanVal.includes('{') || cleanVal.includes('<script') || cleanVal.length > 100) {
    return fallbackVal;
  }
  return cleanVal;
};

const firebaseConfig = {
  apiKey: getCleanVal(import.meta.env.VITE_FIREBASE_API_KEY, fallbackConfig.apiKey),
  authDomain: getCleanVal(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, fallbackConfig.authDomain),
  projectId: getCleanVal(import.meta.env.VITE_FIREBASE_PROJECT_ID, fallbackConfig.projectId),
  storageBucket: getCleanVal(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, fallbackConfig.storageBucket),
  messagingSenderId: getCleanVal(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, fallbackConfig.messagingSenderId),
  appId: getCleanVal(import.meta.env.VITE_FIREBASE_APP_ID, fallbackConfig.appId),
  firestoreDatabaseId: getCleanVal(import.meta.env.VITE_FIREBASE_DATABASE_ID, fallbackConfig.firestoreDatabaseId)
};

const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '';

let app;
if (getApps().length === 0) {
  if (isConfigValid) {
    console.log("Initializing Firebase with config (apiKey hidden)");
    app = initializeApp(firebaseConfig);
  } else {
    console.error("Firebase config is invalid! Check your environment variables or firebase-applet-config.json.");
    app = null;
  }
} else {
  app = getApp();
}

export const auth = app ? getAuth(app) : null;

// Use initializeFirestore with long polling to avoid connectivity issues in AI Studio preview environment
const createDbInstance = (dbId: string) => {
  if (!app) return null;
  
  try {
    const isAiStudio = window.location.hostname.includes('europe-west3.run.app') || 
                       window.location.hostname.includes('localhost') ||
                       window.location.hostname.includes('0.0.0.0');
    
    console.log(`Initializing Firestore with ID: "${dbId}" (Resilient Long Polling Enabled)`);
    // Using initializeFirestore instead of getFirestore to pass custom settings
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch (err: any) {
    // If already initialized (common if module reloads), we use getFirestore to retrieve it
    if (err.code === 'failed-precondition' || err.message?.includes('already exist')) {
      return getFirestore(app, dbId);
    }
    console.error(`Could not initialize Firestore with ID: "${dbId}":`, err);
    return null;
  }
};

// Export the database instances
const targetDbId = (firebaseConfig.firestoreDatabaseId && 
                    firebaseConfig.firestoreDatabaseId !== 'undefined') 
  ? firebaseConfig.firestoreDatabaseId 
  : '(default)';

// 'db' is the primary one from config (often Enterprise in AI Studio)
export const db = createDbInstance(targetDbId);

// 'dbStandard' is always (default)
export const dbStandard = targetDbId === '(default)' ? db : createDbInstance('(default)');

// 'dbEnterprise' is an alias for db (the custom one)
export const dbEnterprise = db;

async function testConnection(dbInstance: any, name: string) {
  if (!dbInstance) return;
  try {
    console.log(`Testing Firestore connection for ${name}...`);
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    console.log(`Firestore connection test for ${name} completed`);
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error(`Firebase connection error for ${name}: The client is offline.`);
    } else {
      console.log(`Firestore connection test for ${name} finished`);
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection(db, 'Primary');
  if (dbStandard && dbStandard !== db) {
    testConnection(dbStandard, 'Standard');
  }
}

export const storage = app ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
