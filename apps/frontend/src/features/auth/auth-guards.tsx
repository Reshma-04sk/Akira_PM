import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-hooks";
import { UserRole } from "./auth-types";
import { LoadingScreen } from "@/components/common/LoadingScreen";

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();

  if (status === "Loading" || status === "Refreshing") {
    return <LoadingScreen />;
  }

  if (status === "Unauthenticated" || status === "Expired") {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();

  if (status === "Loading" || status === "Refreshing") {
    return <LoadingScreen />;
  }

  if (status === "Authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { user, status } = useAuth();

  if (status === "Loading" || status === "Refreshing") {
    return <LoadingScreen />;
  }

  const hasRole = user && allowedRoles.includes(user.role);

  if (!hasRole) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <h3 className="text-sm font-bold text-destructive mb-1">Access Denied</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            You do not have the required permissions to access this feature.
          </p>
        </div>
      )
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RoleGuard = RequireRole;
