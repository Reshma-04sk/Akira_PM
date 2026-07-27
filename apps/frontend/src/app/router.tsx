import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { BlankLayout } from "@/components/layout/BlankLayout";
import { NotFound } from "@/components/common/NotFound";
import { PageContainer } from "@/components/common/PageContainer";
import { ProtectedRoute, PublicRoute } from "@/features/auth/auth-guards";

// Import Auth UI Pages
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { EmailVerificationPage } from "@/features/auth/pages/EmailVerificationPage";

// Import Feature Dashboard Page
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

// Import Projects Module Pages
import { ProjectsListPage } from "@/features/projects/pages/ProjectsListPage";
import { ProjectDetailsPage } from "@/features/projects/pages/ProjectDetailsPage";

// Import Tasks Module Page
import { TasksListPage } from "@/features/tasks/pages/TasksListPage";

// Reusable marketing landing placeholder
const LandingPlaceholder = () => (
  <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h2 className="text-3xl font-bold tracking-tight">Welcome to Akira PM</h2>
    <p className="mt-2 text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
      Collaborative, production-grade project management built for high performance teams.
    </p>
  </PageContainer>
);

const SettingsPlaceholder = () => (
  <PageContainer>
    <div className="p-6 border border-dashed border-border rounded-lg">
      <h2 className="text-xl font-bold">Settings Placeholder</h2>
      <p className="mt-1 text-sm text-muted-foreground">User settings, organization details, and theme configurations.</p>
    </div>
  </PageContainer>
);

export const router = createBrowserRouter([
  // Public marketing routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPlaceholder />,
      },
    ],
  },
  // Auth routes (Blank layout, wrapped with PublicRoute)
  {
    element: <PublicRoute><BlankLayout /></PublicRoute>,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "verify-email",
        element: <EmailVerificationPage />,
      },
    ],
  },
  // Protected routes (wrapped with ProtectedRoute)
  {
    element: <ProtectedRoute><ProtectedLayout /></ProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "projects",
        element: <ProjectsListPage />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetailsPage />,
      },
      {
        path: "tasks",
        element: <TasksListPage />,
      },
      {
        path: "settings",
        element: <SettingsPlaceholder />,
      },
    ],
  },
  // Catch all 404
  {
    path: "*",
    element: <NotFound />,
  },
]);
