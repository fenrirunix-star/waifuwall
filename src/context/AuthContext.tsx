import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { auth, db, googleProvider, githubProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (wallpaperId: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['mozelentreprise@gmail.com', 'fenrirunix@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize with Firebase Auth state
  useEffect(() => {
    // Proactive connection test
    const testConnection = async () => {
      if (db) {
        try {
          const { getDocFromServer } = await import('firebase/firestore');
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error: any) {
          if (error.message?.includes('the client is offline')) {
            console.warn("CRITICAL: Firebase configuration check failed. The client is reporting as 'offline'. Please verify your VITE_FIREBASE_PROJECT_ID, ensure Firestore Database is fully initialized in the Firebase Console, and check if any AdBlocker is blocking the connection.");
          } else if (error.message?.includes('Missing or insufficient permissions')) {
            console.log("Firebase connection verified successfully.");
          } else {
            console.warn("Firebase test connection failed:", error);
          }
        }
      }
    };
    testConnection();

    // Try to recover session from cookies first
    const savedSession = Cookies.get('wallpro_session');
    if (savedSession) {
      try {
        const profile = JSON.parse(savedSession);
        setUser(profile);
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    }

    if (!auth || !db) {
      console.warn("Firebase not properly initialized. Services will be unavailable.");
      setIsLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        try {
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const isSpecialAdmin = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              isPremium: isSpecialAdmin,
              isAdmin: isSpecialAdmin,
              favorites: [],
            };
            await setDoc(userRef, newProfile);

            // Trigger Welcome Email for new social logins or first detections
            if (newProfile.email) {
              fetch('/api/send-welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newProfile.email, displayName: newProfile.displayName }),
              }).catch(e => console.error("Welcome email trigger failed", e));
            }
          } else {
            const profile = userDoc.data() as UserProfile;
            const isSpecialAdmin = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
            if (isSpecialAdmin && !profile.isAdmin) {
              await updateDoc(userRef, {
                isAdmin: true,
                isPremium: true
              });
            }
          }

          // Start real-time listener for profile
          unsubscribeProfile = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              const updatedProfile = doc.data() as UserProfile;
              setUser(updatedProfile);
              Cookies.set('wallpro_session', JSON.stringify(updatedProfile), { expires: 7, secure: true, sameSite: 'strict' });
              setIsLoading(false);
            }
          }, (err) => {
            setIsLoading(false);
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          });

        } catch (err: any) {
          console.warn("Firestore Error Fetching User Profile:", err);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        Cookies.remove('wallpro_session');
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) {
      throw new Error("Registration/Login is currently unavailable because Firebase is not configured. Please set your API keys in the settings.");
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      // Map Firebase error codes to user-friendly messages
      const errorCode = error.code || "";
      const isSpecialAdmin = ADMIN_EMAILS.includes(email.trim());

      if (isSpecialAdmin && errorCode.includes('invalid-credential')) {
        try {
          // Attempt to auto-register the admin if they haven't created an account yet
          await register(email, password, email.split('@')[0]);
          return;
        } catch (regError: any) {
          if (regError.message && (regError.message.includes('already registered') || regError.message.includes('already-in-use'))) {
            throw new Error(`Le compte admin "${email.trim()}" existe déjà sur Firebase mais avec un mot de passe différent (ou a été créé via Google Auth). Impossible d'utiliser le mot de passe que vous avez saisi.\n\n➔ Cliquez sur "Forgot?" ci-dessous pour le réinitialiser ou\n➔ Utilisez le bouton de connexion Google.`);
          }
          throw regError; // Other registration errors
        }
      }
      
      if (errorCode.includes('invalid-credential') || errorCode.includes('user-not-found') || errorCode.includes('wrong-password')) {
        throw new Error("Mot de passe ou email incorrect. Si vous n'avez pas de compte, veuillez vous inscrire.");
      } else if (errorCode.includes('user-disabled')) {
        throw new Error("This account has been disabled. Please contact support.");
      } else if (errorCode.includes('too-many-requests')) {
        throw new Error("Too many failed login attempts. Please try again later or reset your password.");
      } else if (errorCode.includes('unauthorized-domain')) {
        const domain = window.location.hostname;
        throw new Error(`Firebase Security Error: This domain (${domain}) is not authorized. Please add it to your Firebase Console under Authentication > Settings > Authorized domains.`);
      } else {
        // Fallback to error message but strip the "Firebase: " prefix if it exists
        const cleanMsg = error.message?.replace("Firebase: ", "").replace(/Error \(auth\/(.*)\)\.?/, "$1") || "Unknown error";
        throw new Error(`Login failed: ${cleanMsg}`);
      }
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    if (!auth || !db) {
      throw new Error("Registration is currently unavailable because Firebase is not configured.");
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const isSpecialAdmin = ADMIN_EMAILS.includes(email.trim());
      
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        displayName,
        email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`,
        isPremium: isSpecialAdmin,
        isAdmin: isSpecialAdmin,
        favorites: [],
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);

      // Trigger Welcome Email
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newProfile.email, displayName: newProfile.displayName }),
      }).catch(e => console.error("Welcome email trigger failed", e));
    } catch (error: any) {
      console.error('Registration failed', error);
      const errorCode = error.code || "";
      const errorMsg = error.message || "";
      if (errorCode === 'auth/email-already-in-use' || errorMsg.includes('auth/email-already-in-use')) {
        throw new Error(`Cet e-mail est déjà utilisé. Veuillez vous connecter.`);
      } else if (errorCode === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`Erreur de sécurité Firebase: Le domaine (${domain}) n'est pas autorisé.\n\nPour corriger:\n1. Allez sur Firebase Console\n2. Authentication > Settings > Authorized domains\n3. Ajoutez "${domain}" à la liste.`);
      } else {
        throw new Error(`L'inscription a échoué: ${error.message}`);
      }
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') return;
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error("Login popup was blocked by your browser. Please allow popups for this site or try again.");
      }
      
      console.error('Google sign in failed', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') return;
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error("Login popup was blocked by your browser. Please allow popups for this site or try again.");
      }

      console.error('Github sign in failed', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error("Password reset is currently unavailable because Firebase is not configured.");
    }
    if (!email) {
      throw new Error("Veuillez saisir votre adresse e-mail pour réinitialiser votre mot de passe.");
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error("Aucun compte trouvé avec cette adresse e-mail.");
      }
      throw new Error(`Erreur lors de la réinitialisation: ${error.message}`);
    }
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      Cookies.remove('wallpro_session');
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const toggleFavorite = async (wallpaperId: string) => {
    if (!user || !db) return;

    const isFavorite = (user.favorites || []).includes(wallpaperId);
    const userRef = doc(db, 'users', user.uid);

    try {
      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(wallpaperId)
        });
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(wallpaperId)
        });
      }
    } catch (error) {
      console.error('Failed to update favorites', error);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !db) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, data);
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      signInWithGoogle, 
      signInWithGithub,
      resetPassword,
      logout, 
      toggleFavorite,
      updateUserProfile, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
