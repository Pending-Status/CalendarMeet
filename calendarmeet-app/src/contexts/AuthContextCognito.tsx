import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
  type SignUpOutput
} from 'aws-amplify/auth';
import '../awsConfig';

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
  currentUser: any | null;
  userProfile: UserProfile | null;
  signup: (
    email: string,
    password: string,
    displayName: string,
    additionalInfo?: Partial<UserProfile>
  ) => Promise<SignUpOutput>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
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
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (
    email: string,
    password: string,
    displayName: string,
    additionalInfo: Partial<UserProfile> = {}
  ): Promise<SignUpOutput> => {
    // Use email as username since the new user pool is configured for email sign-in
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email: email,
          name: displayName,
        },
      },
    });

    return result;
  };

  // Confirm signup with verification code
  const confirmSignup = async (email: string, code: string) => {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  };

  // Sign in with email and password
  const signin = async (email: string, password: string) => {
    const result = await signIn({
      username: email,
      password,
    });
    return result;
  };

  // Hosted UI: Google federation (requires OAuth config in awsConfig)
  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign-in with redirect...');
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Google sign-in error details:', error);
      throw new Error(error?.message || 'Google sign-in failed. Please check OAuth configuration.');
    }
  };

  const requestPasswordReset = async (email: string) => {
    await resetPassword({ username: email });
  };

  const confirmPasswordReset = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  };

  // Sign out
  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const attributesToUpdate: Record<string, string> = {};

    if (updates.displayName !== undefined) {
      attributesToUpdate.name = updates.displayName;
    }
    if (updates.major !== undefined) {
      attributesToUpdate['custom:major'] = updates.major;
    }
    if (updates.year !== undefined) {
      attributesToUpdate['custom:year'] = updates.year;
    }
    if (updates.bio !== undefined) {
      attributesToUpdate['custom:bio'] = updates.bio;
    }
    if (updates.interests !== undefined) {
      attributesToUpdate['custom:interests'] = JSON.stringify(updates.interests);
    }

    await updateUserAttributes({
      userAttributes: attributesToUpdate,
    });

    // Refresh user profile
    await loadUserProfile();
  };

  // Load user profile from Cognito attributes
  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const profile: UserProfile = {
        uid: user.username,
        email: attributes.email || null,
        displayName: attributes.name || null,
        photoURL: attributes.picture || null,
        major: attributes['custom:major'] || '',
        year: attributes['custom:year'] || '',
        bio: attributes['custom:bio'] || '',
        interests: attributes['custom:interests']
          ? JSON.parse(attributes['custom:interests'])
          : [],
        createdAt: new Date().toISOString(),
        friends: [],
        eventsAttending: [],
        eventsCreated: [],
      };

      setUserProfile(profile);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadUserProfile();
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextValue = {
    currentUser,
    userProfile,
    signup,
    confirmSignup,
    signin,
    signInWithGoogle,
    logout,
    updateUserProfile,
    loading,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
