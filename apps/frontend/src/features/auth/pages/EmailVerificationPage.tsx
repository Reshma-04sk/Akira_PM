import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/data-display";
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm"
    >
      <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Email Verification</CardTitle>
          <CardDescription>Verifying your email address details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          {status === "verifying" && (
            <div className="space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Checking token parameters, please wait...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you! Your email address has been successfully verified.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors focus:outline-none"
              >
                Sign In to Workspace
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                The verification token is missing or has expired. Please check the link or request a new one.
              </p>
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors focus:outline-none"
              >
                Return to sign up
              </Link>
            </div>
          )}
        </CardContent>
        {status !== "success" && (
          <CardFooter className="flex justify-center text-center pb-6">
            <Link
              to="/login"
              className="text-xs font-semibold text-primary hover:text-primary/85 transition-colors focus:outline-none"
            >
              Return to sign in
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};
