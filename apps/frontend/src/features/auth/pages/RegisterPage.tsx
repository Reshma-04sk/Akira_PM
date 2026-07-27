import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { authApi } from "@/services/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/data-display";
import { toast } from "@/components/ui/feedback";

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required").max(100),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success("Account created successfully!", "Check your email inbox or log in directly.");
      navigate("/login");
    } catch (error: any) {
      toast.error("Registration failed", error.message || "An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Join Akira PM to manage your team workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField error={errors.name?.message}>
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={loading}
                {...register("name")}
              />
            </FormField>

            <FormField error={errors.email?.message}>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                {...register("email")}
              />
            </FormField>

            <FormField error={errors.password?.message}>
              <FormLabel>Password</FormLabel>
              <PasswordInput
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                autoComplete="new-password"
                disabled={loading}
                {...register("password")}
              />
            </FormField>

            <FormField error={errors.confirmPassword?.message}>
              <FormLabel>Confirm Password</FormLabel>
              <PasswordInput
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                autoComplete="new-password"
                disabled={loading}
                {...register("confirmPassword")}
              />
            </FormField>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-center pb-6">
          <span className="text-[11px] text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:text-primary/85 transition-colors focus:outline-none"
            >
              Sign in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
