import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/auth-hooks";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/selection";
import { FormField, FormLabel } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/data-display";
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
      toast.error("Authentication failed", error.message || "Invalid credentials");
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
          <CardTitle className="text-xl">Sign in to Akira PM</CardTitle>
          <CardDescription>Enter your credentials to access your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <FormLabel>Password</FormLabel>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                autoComplete="current-password"
                disabled={loading}
                {...register("password")}
              />
            </FormField>

            <div className="flex items-center justify-between pt-1">
              <Checkbox
                label="Remember me"
                disabled={loading}
                {...register("rememberMe")}
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-center pb-6">
          <span className="text-[11px] text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-primary hover:text-primary/85 transition-colors focus:outline-none"
            >
              Sign up
            </Link>
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
