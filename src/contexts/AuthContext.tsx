import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, RecaptchaVerifier } from "../../lib/firebase.js";

// Admin user interface (for dummy login only)
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

// Your original UserProfile interface
interface UserProfile {
  uid: string;
  fullName: string;
  phoneNumber: string;
  createdAt: Date;
  lastLoginAt: Date;
  role?: "admin" | "staff" | "citizen";
}

// Updated AuthContextType with all your original methods + admin
interface AuthContextType {
  user: FirebaseUser | null; // Your original Firebase user
  userProfile: UserProfile | null; // Your original Firestore profile
  adminUser: AdminUser | null; // Only for admin dummy login
  loading: boolean;
  isAuthenticated: boolean;

  // Your original Firebase methods
  sendOTP: (phoneNumber: string, fullName?: string) => Promise<string>;
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;

  // Admin dummy login
  loginEmail?: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Your original state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  // Admin state (separate)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Check for admin login on load
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");
    if (token && userData) {
      setAdminUser(JSON.parse(userData));
    }
  }, []);

  // Your original Firebase auth listener (unchanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            setUserProfile({
              uid: user.uid,
              fullName:
                profileData.fullName || profileData.displayName || "User",
              phoneNumber: profileData.phoneNumber || "",
              createdAt: profileData.createdAt?.toDate() || new Date(),
              lastLoginAt: new Date(),
              role: profileData.role || "citizen",
            });

            // Update last login time
            await setDoc(
              doc(db, "users", user.uid),
              {
                lastLoginAt: new Date(),
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Your original setupRecaptcha (unchanged)
  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          // Response expired
        },
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  // Your original sendOTP (unchanged)
  const sendOTP = async (
    phoneNumber: string,
    fullName?: string
  ): Promise<string> => {
    try {
      const verifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );

      // Store fullName temporarily for new users
      if (fullName) {
        sessionStorage.setItem("tempUserName", fullName);
        sessionStorage.setItem("tempPhoneNumber", phoneNumber);
      }

      return confirmationResult.verificationId;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      throw new Error(error.message || "Failed to send OTP");
    }
  };

  // Your original verifyOTP (unchanged)
  const verifyOTP = async (
    verificationId: string,
    otp: string
  ): Promise<void> => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);

      // Check if this is a new user
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (!userDoc.exists()) {
        // New user - create profile
        const tempName = sessionStorage.getItem("tempUserName");
        const tempPhone = sessionStorage.getItem("tempPhoneNumber");

        if (tempName && tempPhone) {
          await setDoc(doc(db, "users", result.user.uid), {
            fullName: tempName,
            phoneNumber: tempPhone,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            role: "citizen",
          });

          // Clear temporary data
          sessionStorage.removeItem("tempUserName");
          sessionStorage.removeItem("tempPhoneNumber");
        }
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      throw new Error(error.message || "Invalid OTP");
    }
  };

  // Firebase email/password signup (restored)
  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName,
        fullName: displayName,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        role: "citizen",
        stats: {
          reportsSubmitted: 0,
          reportsResolved: 0,
          communityPoints: 0,
        },
      });

      return user;
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage =
            "This email is already registered. Try signing in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please choose a stronger password.";
          break;
      }

      throw new Error(errorMessage);
    }
  };

  // Firebase email/password signin (restored)
  const signIn = async (
    email: string,
    password: string
  ): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Failed to sign in. Please try again.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage =
            "No account found with this email. Please sign up first.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
      }

      throw new Error(errorMessage);
    }
  };

  // Admin dummy login (only for admin panel)
  const loginEmail = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    if (email === "admin@civicconnect.com" && password === "admin123") {
      const userData: AdminUser = {
        id: "1",
        name: "Admin User",
        email: "admin@civicconnect.com",
        role: "admin",
      };

      localStorage.setItem("adminToken", "demo-token-123");
      localStorage.setItem("adminUser", JSON.stringify(userData));
      setAdminUser(userData);
      return true;
    }
    return false;
  };

  // Your original logout (updated to handle both)
  const logout = async (): Promise<void> => {
    try {
      // Firebase logout
      if (user) {
        await signOut(auth);
        setUserProfile(null);
      }

      // Admin logout
      if (adminUser) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setAdminUser(null);
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user, // Firebase user
    userProfile, // Firestore profile
    adminUser, // Admin dummy user
    loading,
    sendOTP, // Your phone OTP
    verifyOTP, // Your phone OTP
    signUp, // Your Firebase email signup
    signIn, // Your Firebase email signin
    loginEmail, // Admin dummy login
    logout, // Handles both
    isAuthenticated: !!user || !!adminUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
};
