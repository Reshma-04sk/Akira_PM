import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { BlankLayout } from "@/components/layout/BlankLayout";
import { NotFound } from "@/components/common/NotFound";
import { RouteErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingScreen } from "@/components/common/LoadingScreen";

import { ProtectedRoute, PublicRoute } from "@/features/auth/auth-guards";
import { AIProvider } from "@/context/AIContext";

// Lazy load Auth UI Pages
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const EmailVerificationPage = lazy(() =>
  import("@/features/auth/pages/EmailVerificationPage").then((m) => ({ default: m.EmailVerificationPage }))
);

// Lazy load Feature Dashboard Page
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);

// Lazy load Projects Module Pages
const ProjectsListPage = lazy(() =>
  import("@/features/projects/pages/ProjectsListPage").then((m) => ({ default: m.ProjectsListPage }))
);
const ProjectDetailsPage = lazy(() =>
  import("@/features/projects/pages/ProjectDetailsPage").then((m) => ({ default: m.ProjectDetailsPage }))
);

// Lazy load Tasks Module Page
const TasksListPage = lazy(() =>
  import("@/features/tasks/pages/TasksListPage").then((m) => ({ default: m.TasksListPage }))
);

// Lazy load Settings & Teams Module Pages
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const TeamsPage = lazy(() =>
  import("@/features/teams/pages/TeamsPage").then((m) => ({ default: m.TeamsPage }))
);

// Lazy load Calendar & Reports Module Pages
const CalendarPage = lazy(() =>
  import("@/features/calendar/pages/CalendarPage").then((m) => ({ default: m.CalendarPage }))
);
const ReportsPage = lazy(() =>
  import("@/features/reports/pages/ReportsPage").then((m) => ({ default: m.ReportsPage }))
);

// Lazy-loaded marketing pages
const HomePage = lazy(() => import("@/features/marketing/pages/HomePage").then((m) => ({ default: m.HomePage })));
const FeaturesPage = lazy(() => import("@/features/marketing/pages/FeaturesPage"));
const PricingPage = lazy(() => import("@/features/marketing/pages/PricingPage"));
const AboutPage = lazy(() => import("@/features/marketing/pages/AboutPage"));
const ContactPage = lazy(() => import("@/features/marketing/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/features/marketing/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/features/marketing/pages/TermsPage"));

export const router = createBrowserRouter([
  // Public marketing routes
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Suspense fallback={null}><HomePage /></Suspense>,
      },
      {
        path: "features",
        element: <Suspense fallback={null}><FeaturesPage /></Suspense>,
      },
      {
        path: "pricing",
        element: <Suspense fallback={null}><PricingPage /></Suspense>,
      },
      {
        path: "about",
        element: <Suspense fallback={null}><AboutPage /></Suspense>,
      },
      {
        path: "contact",
        element: <Suspense fallback={null}><ContactPage /></Suspense>,
      },
      {
        path: "privacy",
        element: <Suspense fallback={null}><PrivacyPage /></Suspense>,
      },
      {
        path: "terms",
        element: <Suspense fallback={null}><TermsPage /></Suspense>,
      },
    ],
  },
  // Auth routes (Blank layout, wrapped with PublicRoute)
  {
    element: <PublicRoute><BlankLayout /></PublicRoute>,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "login",
        element: <Suspense fallback={<LoadingScreen />}><LoginPage /></Suspense>,
      },
      {
        path: "register",
        element: <Suspense fallback={<LoadingScreen />}><RegisterPage /></Suspense>,
      },
      {
        path: "forgot-password",
        element: <Suspense fallback={<LoadingScreen />}><ForgotPasswordPage /></Suspense>,
      },
      {
        path: "reset-password",
        element: <Suspense fallback={<LoadingScreen />}><ResetPasswordPage /></Suspense>,
      },
      {
        path: "verify-email",
        element: <Suspense fallback={<LoadingScreen />}><EmailVerificationPage /></Suspense>,
      },
    ],
  },
  // Protected routes (wrapped with ProtectedRoute)
  {
    element: <ProtectedRoute><AIProvider><ProtectedLayout /></AIProvider></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "dashboard",
        element: <Suspense fallback={<LoadingScreen />}><DashboardPage /></Suspense>,
      },
      {
        path: "projects",
        element: <Suspense fallback={<LoadingScreen />}><ProjectsListPage /></Suspense>,
      },
      {
        path: "projects/:id",
        element: <Suspense fallback={<LoadingScreen />}><ProjectDetailsPage /></Suspense>,
      },
      {
        path: "tasks",
        element: <Suspense fallback={<LoadingScreen />}><TasksListPage /></Suspense>,
      },
      {
        path: "calendar",
        element: <Suspense fallback={<LoadingScreen />}><CalendarPage /></Suspense>,
      },
      {
        path: "reports",
        element: <Suspense fallback={<LoadingScreen />}><ReportsPage /></Suspense>,
      },
      {
        path: "teams",
        element: <Suspense fallback={<LoadingScreen />}><TeamsPage /></Suspense>,
      },
      {
        path: "settings",
        element: <Suspense fallback={<LoadingScreen />}><SettingsPage /></Suspense>,
      },
    ],
  },
  // Catch all 404
  {
    path: "*",
    element: <NotFound />,
  },
]);
