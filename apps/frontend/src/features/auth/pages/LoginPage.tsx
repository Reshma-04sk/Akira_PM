import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      await login({ email: data.email, password: data.password }, data.rememberMe);
      toast.success("Welcome back!", "Successfully signed in to Akira PM");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Invalid email or password";
      toast.error("Authentication failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Left Side: Editorial Branding */}
      <div className="hidden md:flex flex-col justify-center space-y-6 p-8 border-r border-[#26262b]">
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
      </div>

      {/* Right Side: Auth Form Panel */}
      <div className="bg-[#131316] border border-[#26262b] rounded-2xl p-8 shadow-2xl space-y-6">
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
              disabled={loading}
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
              disabled={loading}
              className="bg-[#111113] border-[#26262b] focus:border-[#ff4d2e] text-[#f3f1ec] placeholder-[#77747a]"
              {...register("password")}
            />
          </FormField>

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              id="rememberMe"
              label="Keep me signed in"
              {...register("rememberMe")}
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            className="w-full bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06] font-semibold py-2.5 transition-all cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </Button>
        </form>

        <div className="text-center text-xs text-[#8b8a90] pt-4 border-t border-[#26262b]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#f3f1ec] hover:text-[#ff4d2e] font-medium transition-colors">
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
