// contexts/DepartmentAuthContext.tsx - Simplified version
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface DepartmentUser {
  uid: string;
  email: string;
  displayName: string;
  department: string;
  role: 'department_admin' | 'department_worker';
  isActive: boolean;
}

interface DepartmentAuthContextType {
  user: DepartmentUser | null;
  firebaseUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const DepartmentAuthContext = createContext<DepartmentAuthContextType | null>(null);

// Simple department mapping - you can make this more sophisticated later
const getDepartmentFromEmail = (email: string): DepartmentUser | null => {
  const departmentMap: Record<string, Omit<DepartmentUser, 'uid' | 'email'>> = {
    'publicworks@civic.gov': {
      displayName: 'Public Works Department',
      department: 'Public Works',
      role: 'department_admin',
      isActive: true
    },
    'water@civic.gov': {
      displayName: 'Water Department',
      department: 'Water & Utilities', 
      role: 'department_admin',
      isActive: true
    },
    'electrical@civic.gov': {
      displayName: 'Electrical Department',
      department: 'Street Lighting',
      role: 'department_admin', 
      isActive: true
    },
    'waste@civic.gov': {
      displayName: 'Waste Management',
      department: 'Waste Management',
      role: 'department_admin',
      isActive: true
    }
  };

  const deptInfo = departmentMap[email];
  if (!deptInfo) return null;

  return {
    uid: '', // Will be filled with Firebase UID
    email,
    ...deptInfo
  };
};

export const DepartmentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DepartmentUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser && firebaseUser.email) {
        // Check if this email is a valid department email
        const departmentUser = getDepartmentFromEmail(firebaseUser.email);
        
        if (departmentUser) {
          setUser({
            ...departmentUser,
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
          setFirebaseUser(firebaseUser);
        } else {
          setError('You are not authorized to access the department portal.');
          await signOut(auth);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    // First check if email is valid department email
    if (!getDepartmentFromEmail(email)) {
      setError('Invalid department credentials');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Department login error:', error);
      setError(
        error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password'
          : 'Login failed. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DepartmentAuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      login,
      logout,
      error
    }}>
      {children}
    </DepartmentAuthContext.Provider>
  );
};

export const useDepartmentAuth = () => {
  const context = useContext(DepartmentAuthContext);
  if (!context) {
    throw new Error('useDepartmentAuth must be used within DepartmentAuthProvider');
  }
  return context;
};
