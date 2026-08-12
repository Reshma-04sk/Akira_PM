import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/feedback";
import { authApi } from "@/services/api/auth.api";

type VerificationStatus = "verifying" | "success" | "error";

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const token = searchParams.get("token") || "";

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        return;
      }
      try {
        await authApi.verifyEmail(token);
        setStatus("success");
        toast.success("Email verified!", "You can now log in to access your dashboard workspace.");
      } catch {
        setStatus("error");
        toast.error("Verification failed", "The verification token was invalid or expired.");
      }
    };
    verifyToken();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-sm space-y-8"
    >
      {/* Akira Branding */}
      <div className="text-center space-y-2">
        <h1 className="font-['Instrument_Serif'] italic text-3xl text-[#f5f5f3] tracking-tight">
          Email Verification
        </h1>
        <p className="text-[11px] text-[#707070] font-mono uppercase tracking-widest">
          AKIRA PM — Identity Confirmation
        </p>
      </div>

      {/* Auth Card */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          {status === "verifying" && (
            <div className="space-y-4 py-4">
              <Loader2 className="h-8 w-8 text-white/80 animate-spin mx-auto" />
              <p className="text-xs text-[#a3a3a3]">Checking token parameters, please wait...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 py-2 w-full">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Thank you! Your email address has been successfully verified.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-[#f5f5f3] text-black text-xs font-semibold hover:bg-white transition-colors focus:outline-none"
              >
                Sign In to Workspace
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 py-2 w-full">
              <XCircle className="h-10 w-10 text-rose-500 mx-auto" />
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                The verification token is missing or has expired. Please check the link or request a new one.
              </p>
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-[#f5f5f3] text-black text-xs font-semibold hover:bg-white transition-colors focus:outline-none"
              >
                Return to sign up
              </Link>
            </div>
          )}
        </div>
        {status !== "success" && (
          <div className="flex justify-center text-center py-4 border-t border-white/5">
            <Link
              to="/login"
              className="text-xs font-semibold text-white/50 hover:text-white transition-colors focus:outline-none"
            >
              Return to sign in
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmailVerificationPage;
