import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/data-display";
import { toast } from "@/components/ui/feedback";
import { authApi } from "@/services/api/auth.api";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SchemaType = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Extract token parameter from URL
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: SchemaType) => {
    if (!token) {
      toast.error("Invalid token", "Reset token was missing from the link URL parameter.");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({ token, password: data.password });

      toast.success("Password reset successfully", "You can now log in with your new credentials.");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to reset password", error.message || "An unexpected error occurred");
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
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-xs text-destructive leading-relaxed">
                The password reset token is missing or has expired. Please request a new recovery link.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors focus:outline-none"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField error={errors.password?.message}>
                <FormLabel>New Password</FormLabel>
                <PasswordInput
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  autoComplete="new-password"
                  disabled={loading}
                  {...register("password")}
                />
              </FormField>

              <FormField error={errors.confirmPassword?.message}>
                <FormLabel>Confirm New Password</FormLabel>
                <PasswordInput
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  autoComplete="new-password"
                  disabled={loading}
                  {...register("confirmPassword")}
                />
              </FormField>

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-center pb-6">
          <Link
            to="/login"
            className="text-xs font-semibold text-primary hover:text-primary/85 transition-colors focus:outline-none"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
