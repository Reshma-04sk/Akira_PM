import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/services/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { toast } from "@/components/ui/feedback";

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required").max(100),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterSchemaType = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    try {
      setLoading(true);
      await authApi.register({
        full_name: data.name,
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success("Workspace created!", "You can now sign in with your credentials.");
      navigate("/login");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "An unexpected error occurred during signup";
      toast.error("Registration failed", errorMsg);
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
          Create your <span className="text-[#ff4d2e]">workspace</span>.
        </h1>
        <p className="text-[#8b8a90] text-sm leading-relaxed max-w-sm">
          "Build the system your team actually runs."
        </p>
      </div>

      {/* Right Side: Auth Form Panel */}
      <div className="bg-[#131316] border border-[#26262b] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-[#f3f1ec]">Create account</h2>
          <p className="text-xs text-[#8b8a90]">
            Get started with Akira PM in less than two minutes
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField error={errors.name?.message}>
            <FormLabel>Full name</FormLabel>
            <Input
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={loading}
              className="bg-[#111113] border-[#26262b] focus:border-[#ff4d2e] text-[#f3f1ec] placeholder-[#77747a]"
              {...register("name")}
            />
          </FormField>

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
            <FormLabel>Password</FormLabel>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              className="bg-[#111113] border-[#26262b] focus:border-[#ff4d2e] text-[#f3f1ec] placeholder-[#77747a]"
              {...register("password")}
            />
          </FormField>

          <FormField error={errors.confirmPassword?.message}>
            <FormLabel>Confirm password</FormLabel>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              className="bg-[#111113] border-[#26262b] focus:border-[#ff4d2e] text-[#f3f1ec] placeholder-[#77747a]"
              {...register("confirmPassword")}
            />
          </FormField>

          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            className="w-full bg-[#f3f1ec] text-[#0a0a0b] hover:bg-[#ff4d2e] hover:text-[#1a0a06] font-semibold py-2.5 transition-all cursor-pointer mt-2"
          >
            {loading ? "Creating workspace..." : "Create workspace →"}
          </Button>
        </form>

        <div className="text-center text-xs text-[#8b8a90] pt-4 border-t border-[#26262b]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#f3f1ec] hover:text-[#ff4d2e] font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
