import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  major?: string;
  year?: string;
  interests?: string[];
  bio?: string;
  createdAt?: string;
  friends?: string[];
  eventsAttending?: string[];
  eventsCreated?: string[];
};

type AuthContextValue = {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (
    email: string,
    password: string,
    displayName: string,
    additionalInfo?: Partial<UserProfile>
  ) => Promise<User>;
  signin: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (
    email: string,
    password: string,
    displayName: string,
    additionalInfo: Partial<UserProfile> = {}
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      major: additionalInfo.major || '',
      year: additionalInfo.year || '',
      interests: additionalInfo.interests || [],
      bio: additionalInfo.bio || '',
      createdAt: new Date().toISOString(),
      friends: [],
      eventsAttending: [],
      eventsCreated: []
    });

    return user;
  };

  // Sign in with email and password
  const signin = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    // Create profile if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        major: '',
        year: '',
        interests: [],
        bio: '',
        createdAt: new Date().toISOString(),
        friends: [],
        eventsAttending: [],
        eventsCreated: []
      });
    }

    return user;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Load user profile
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
      setUserProfile(prev => ({ ...(prev ?? {}), ...updates } as UserProfile));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    signin,
    signInWithGoogle,
    logout,
    updateUserProfile,
    loading,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
