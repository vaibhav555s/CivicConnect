import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Shield, Mail } from "lucide-react"; // Changed from Phone to Mail

interface ProtectedRouteProps {
  children: React.ReactNode;
  onAuthRequired: () => void;
  message?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onAuthRequired,
  message = "Sign in to access this feature",
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <section className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-borders border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-sm mx-auto animate-fade-in">
          <div className="w-20 h-20 bg-subtle rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-accent mb-2">
            Authentication Required
          </h1>
          <p className="text-text-secondary mb-8">{message}</p>
          <button
            onClick={onAuthRequired}
            className="btn-primary px-8 py-3 rounded-xl flex items-center space-x-2 mx-auto"
          >
            <Mail className="w-5 h-5" /> {/* Changed from Phone to Mail */}
            <span>Sign In</span>
          </button>
        </div>

        {/* Custom CSS for animations */}
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
  }

  return <>{children}</>;
};

export default ProtectedRoute;
