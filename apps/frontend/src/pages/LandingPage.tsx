import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import {
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
  Code2,
  CheckCircle,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Lock,
      title: "JWT & Token Rotation",
      description: "Short-lived JWT access tokens paired with secure, hash-verified refresh token rotation.",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access Control",
      description: "Declarative RBAC dependency injection checking permissions across admin and user roles.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Server,
      title: "FastAPI & SQLAlchemy 2.0",
      description: "Stateless, high-throughput Python async engine backed by PostgreSQL and Alembic migrations.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: RefreshCw,
      title: "Axios Queue Interceptor",
      description: "Automatic 401 token refresh queueing in the client layer for seamless user experience.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: Code2,
      title: "React Hook Form + Zod",
      description: "Strict compile-time & runtime type-safe form validation with instant error feedback.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      icon: Layers,
      title: "Monorepo Architecture",
      description: "Modular feature-first architecture maintaining clean separation between API and UI layers.",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Zap className="w-6 h-6 text-purple-400 fill-purple-400/20" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Apex SaaS
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-slate-100 transition">
            Features
          </a>
          <a href="#architecture" className="hover:text-slate-100 transition">
            Architecture
          </a>
          <a href="#security" className="hover:text-slate-100 transition">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-600/20"
            >
              <span>Dashboard ({user?.email})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-600/20"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-24 text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Production-Grade Monorepo Architecture
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Empower Your Monorepo With{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Enterprise Authentication
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A production-ready SaaS foundation built with FastAPI, SQLAlchemy 2.0 async, React 19, and Tailwind CSS.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-base font-bold transition shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-base font-bold transition shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-base font-semibold transition flex items-center justify-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="px-6 lg:px-12 py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Architected for Reliability and Security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition duration-300 backdrop-blur-sm flex flex-col"
                >
                  <div className={`p-3 ${item.bg} border ${item.border} rounded-xl w-fit mb-5`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section id="security" className="px-6 lg:px-12 py-20">
        <div className="max-w-5xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Security-First Design
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2 mb-4">
                Stateless JWT & Hashed Refresh Tokens
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Protects session integrity using SHA-256 hashed refresh tokens. Revoked tokens instantly block access across API routes.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                {[
                  "Bcrypt password hashing with salt",
                  "Short-lived access tokens (15-30 min)",
                  "Automatic refresh token rotation",
                  "Role-based dependency injection",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950 p-6 border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 shadow-inner">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-slate-500">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2">auth_flow.py</span>
              </div>
              <p className="text-purple-400">@router.post("/refresh")</p>
              <p className="text-slate-400">async def refresh_tokens(data: RefreshTokenRequest):</p>
              <p className="pl-4 text-slate-300">token_hash = hash_refresh_token(data.token)</p>
              <p className="pl-4 text-slate-300">stored_token = await repo.get_by_hash(token_hash)</p>
              <p className="pl-4 text-emerald-400"># Verify revocation & expiration</p>
              <p className="pl-4 text-slate-300">if not stored_token or stored_token.revoked:</p>
              <p className="pl-8 text-red-400">raise UnauthorizedException()</p>
              <p className="pl-4 text-slate-300">return await auth_service.rotate(stored_token)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-6 lg:px-12 py-8 text-center text-slate-500 text-xs">
        <p>© 2026 Apex SaaS Monorepo. All rights reserved.</p>
      </footer>
    </div>
  );
};
