import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { UserRole } from "@/types/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Forbidden</h2>
          <p className="text-slate-400 text-sm mb-4">
            You do not have permission to view this resource. Requires role: <strong className="text-slate-200">{requiredRole}</strong>.
          </p>
          <a href="/dashboard" className="inline-block text-sm text-purple-400 hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
