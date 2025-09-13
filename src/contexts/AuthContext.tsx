import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, RecaptchaVerifier } from '../../lib/firebase.js';

interface UserProfile {
  uid: string;
  fullName: string;
  phoneNumber: string;
  createdAt: Date;
  lastLoginAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  sendOTP: (phoneNumber: string, fullName?: string) => Promise<string>;
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            setUserProfile({
              uid: user.uid,
              fullName: profileData.fullName,
              phoneNumber: profileData.phoneNumber,
              createdAt: profileData.createdAt?.toDate() || new Date(),
              lastLoginAt: new Date()
            });
            
            // Update last login time
            await setDoc(doc(db, 'users', user.uid), {
              lastLoginAt: new Date()
            }, { merge: true });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  const sendOTP = async (phoneNumber: string, fullName?: string): Promise<string> => {
    try {
      const verifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      
      // Store fullName temporarily for new users
      if (fullName) {
        sessionStorage.setItem('tempUserName', fullName);
        sessionStorage.setItem('tempPhoneNumber', phoneNumber);
      }
      
      return confirmationResult.verificationId;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async (verificationId: string, otp: string): Promise<void> => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      
      // Check if this is a new user
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // New user - create profile
        const tempName = sessionStorage.getItem('tempUserName');
        const tempPhone = sessionStorage.getItem('tempPhoneNumber');
        
        if (tempName && tempPhone) {
          await setDoc(doc(db, 'users', result.user.uid), {
            fullName: tempName,
            phoneNumber: tempPhone,
            createdAt: new Date(),
            lastLoginAt: new Date()
          });
          
          // Clear temporary data
          sessionStorage.removeItem('tempUserName');
          sessionStorage.removeItem('tempPhoneNumber');
        }
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Invalid OTP');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
};