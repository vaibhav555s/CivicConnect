// contexts/DepartmentAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface DepartmentUser {
  uid: string;
  email: string | null;
  displayName: string;
  department: string;
  role: 'department_worker' | 'department_admin';
}

interface DepartmentAuthContextType {
  user: DepartmentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const DepartmentAuthContext = createContext<DepartmentAuthContextType | null>(null);

export const useDepartmentAuth = () => {
  const context = useContext(DepartmentAuthContext);
  if (!context) {
    throw new Error('useDepartmentAuth must be used within DepartmentAuthProvider');
  }
  return context;
};

export const DepartmentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DepartmentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // ✅ FIXED DEPARTMENT MAPPING - Now matches Firebase report assignments exactly
      const departmentMapping = {
        'publicworks@civic.gov': 'Public Works Department',
        'water@civic.gov': 'Water & Utilities Department', 
        'electrical@civic.gov': 'Street Lighting Department',
        'waste@civic.gov': 'Waste Management Department'
      };
      
      const department = departmentMapping[email as keyof typeof departmentMapping];
      
      if (!department) {
        throw new Error('Invalid department email');
      }
      
      console.log('🏢 Department login successful:', {
        email: email,
        department: department,
        uid: userCredential.user.uid
      });
      
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: department,
        department: department, // ✅ Now matches Firebase report assignments exactly
        role: 'department_worker'
      });
      
      return true;
    } catch (error) {
      console.error('Department login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('🏢 Department logout successful');
    } catch (error) {
      console.error('Department logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        // Re-establish department context on page refresh
        const departmentMapping = {
          'publicworks@civic.gov': 'Public Works Department',
          'water@civic.gov': 'Water & Utilities Department',
          'electrical@civic.gov': 'Street Lighting Department', 
          'waste@civic.gov': 'Waste Management Department'
        };
        
        const department = departmentMapping[firebaseUser.email as keyof typeof departmentMapping];
        
        if (department) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: department,
            department: department,
            role: 'department_worker'
          });
          console.log('🏢 Department session restored:', department);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DepartmentAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </DepartmentAuthContext.Provider>
  );
};
