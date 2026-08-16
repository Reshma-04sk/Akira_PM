import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useAuth } from "@/features/auth/auth-hooks";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { toast } from "@/components/ui/feedback";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Signing in...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const connectingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (connectingTimerRef.current) clearTimeout(connectingTimerRef.current);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      setIsSuccess(false);
      setLoading(true);
      setStatusText("Signing in...");

      // Reassure user if backend takes a few seconds (e.g. cold start)
      connectingTimerRef.current = setTimeout(() => {
        setStatusText("Still connecting to workspace...");
      }, 3000);

      await login({ email: data.email, password: data.password }, data.rememberMe);

      if (connectingTimerRef.current) clearTimeout(connectingTimerRef.current);
      setIsSuccess(true);
      toast.success("Welcome back!", "Successfully signed in to Akira PM");

      // Brief visual confirmation before navigating
      navigateTimerRef.current = setTimeout(() => {
        navigate("/dashboard");
      }, 400);
    } catch (error: any) {
      if (connectingTimerRef.current) clearTimeout(connectingTimerRef.current);
      setLoading(false);
      setShakeTrigger((prev) => prev + 1);

      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Invalid email or password";
      toast.error("Authentication failed", errorMsg);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -8,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  const leftBrandingVariants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : -14,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const rightCardVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 16,
      scale: prefersReducedMotion ? 1 : 0.985,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
    >
      {/* Left Side: Editorial Branding */}
      <motion.div
        variants={leftBrandingVariants}
        className="hidden md:flex flex-col justify-center space-y-6 p-8 border-r border-[#26262b]"
      >
        <div className="flex items-center gap-2 text-sm font-semibold tracking-[2px] text-[#f3f1ec]">
          <span className="w-2 h-2 rounded-full bg-[#ff4d2e]" />
          AKIRA PM
        </div>
        <h1 className="font-serif italic text-4xl lg:text-5xl text-[#f3f1ec] leading-tight">
          Work, in <span className="text-[#ff4d2e]">motion</span>.
        </h1>
        <p className="text-[#8b8a90] text-sm leading-relaxed max-w-sm">
          "One system for every ticket, sprint, decision, and release."
        </p>
      </motion.div>

      {/* Right Side: Auth Form Panel */}
      <motion.div
        variants={rightCardVariants}
        animate={
          shakeTrigger > 0 && !prefersReducedMotion
            ? {
                x: [0, -7, 7, -5, 5, -2, 2, 0],
                transition: { duration: 0.32, ease: "easeInOut" },
              }
            : undefined
        }
        className="bg-[#131316] border border-[#26262b] rounded-2xl p-8 shadow-2xl space-y-6 transition-colors duration-300"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-[#f3f1ec]">Sign in</h2>
          <p className="text-xs text-[#8b8a90]">
            Enter your credentials to access your Akira PM workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField error={errors.email?.message}>
            <FormLabel>Work email</FormLabel>
            <Input
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={loading || isSuccess}
              className="bg-[#111113] border-[#26262b] focus:border-[#ff4d2e] text-[#f3f1ec] placeholder-[#77747a]"
              {...register("email")}
            />
          </FormField>

          <FormField error={errors.password?.message}>
            <div className="flex justify-between items-center mb-1">
              <FormLabel>Password</FormLabel>
              <Link
                to="/forgot-password"
                className="text-xs text-[#8b8a90] hover:text-[#f3f1ec] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading || isSuccess}
              className="bg-[#111113] border-[#26262b] focus:border-[#ff4d2e] text-[#f3f1ec] placeholder-[#77747a]"
              {...register("password")}
            />
          </FormField>

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              id="rememberMe"
              label="Keep me signed in"
              disabled={loading || isSuccess}
              {...register("rememberMe")}
            />
          </div>

          <Button
            type="submit"
            isLoading={loading && !isSuccess}
            disabled={loading || isSuccess}
            className={`w-full font-semibold py-2.5 transition-all cursor-pointer ${
              isSuccess
                ? "bg-[#10b981] text-[#f3f1ec] hover:bg-[#10b981]"
                : "bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06]"
            }`}
          >
            {isSuccess ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Check className="h-4 w-4 shrink-0" />
                Signed in ✓
              </span>
            ) : loading ? (
              statusText
            ) : (
              "Sign in →"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-[#8b8a90] pt-4 border-t border-[#26262b]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#f3f1ec] hover:text-[#ff4d2e] font-medium transition-colors">
            Create workspace
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
