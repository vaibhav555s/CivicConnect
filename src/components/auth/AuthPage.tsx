import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase"; // Adjust path as needed

interface AuthPageProps {
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Built-in signUp function
  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      console.log("Creating user with:", email, displayName);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("User created:", user.uid);

      // Update the user's display name
      await updateProfile(user, {
        displayName: displayName,
      });

      console.log("Profile updated");

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        role: "citizen",
        stats: {
          reportsSubmitted: 0,
          reportsResolved: 0,
          communityPoints: 0,
        },
      });

      console.log("User data saved to Firestore");
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
        case "auth/operation-not-allowed":
          errorMessage = "Email/password authentication is not enabled.";
          break;
      }

      throw new Error(errorMessage);
    }
  };

  // Built-in signIn function
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("User signed in successfully:", user.uid);
      return user;
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
        case "auth/user-disabled":
          errorMessage =
            "This account has been disabled. Please contact support.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
      }

      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (isNewUser && !fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);

    try {
      if (isNewUser) {
        console.log("Attempting to sign up...");
        await signUp(email, password, fullName.trim());
      } else {
        console.log("Attempting to sign in...");
        await signIn(email, password);
      }

      console.log("Authentication successful!");
      setSuccess(true);

      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: any) {
      console.error("Authentication failed:", error);
      setError(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <section className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center animate-fade-in max-w-sm mx-auto">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-accent mb-2">
            Welcome to CivicConnect!
          </h1>
          <p className="text-text-secondary mb-4">
            You're now logged in and ready to make your city better
          </p>
          <div className="text-sm text-text-secondary">
            Redirecting to home...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-surface">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-borders">
          <button
            onClick={onBack}
            className="p-2 hover:bg-subtle rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-accent">
            {isNewUser ? "Create Account" : "Sign In"}
          </h1>
          <div className="w-9"></div>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-accent mb-2">
              {isNewUser ? "Join CivicConnect" : "Welcome Back"}
            </h2>
            <p className="text-text-secondary">
              {isNewUser
                ? "Create your account to report and track civic issues"
                : "Sign in to continue making your city better"}
            </p>
          </div>

          <div className="flex bg-subtle rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsNewUser(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isNewUser
                  ? "bg-white text-accent shadow-sm"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsNewUser(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isNewUser
                  ? "bg-white text-accent shadow-sm"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isNewUser && (
              <div>
                <label className="block text-caption mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-4 pl-12 input-field rounded-xl"
                    placeholder="Enter your full name"
                    required={isNewUser}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-caption mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 input-field rounded-xl"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-caption mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 input-field rounded-xl"
                  placeholder={
                    isNewUser
                      ? "Create a password (6+ characters)"
                      : "Enter your password"
                  }
                  required
                />
              </div>
              {isNewUser && (
                <p className="text-xs text-text-secondary mt-2">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {isNewUser ? "Creating Account..." : "Signing In..."}
                  </span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>{isNewUser ? "Create Account" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-text-secondary text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  );
};

export default AuthPage;
