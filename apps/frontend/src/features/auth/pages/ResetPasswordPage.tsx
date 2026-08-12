import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-sm space-y-8"
    >
      {/* Akira Branding */}
      <div className="text-center space-y-2">
        <h1 className="font-['Instrument_Serif'] italic text-3xl text-[#f5f5f3] tracking-tight">
          Reset password
        </h1>
        <p className="text-[11px] text-[#707070] font-mono uppercase tracking-widest">
          AKIRA PM — Set New Credentials
        </p>
      </div>

      {/* Auth Card */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          {!token ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-xs text-rose-400 leading-relaxed">
                The password reset token is missing or has expired. Please request a new recovery link.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-[#f5f5f3] text-black text-xs font-semibold hover:bg-white transition-colors focus:outline-none"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        </div>
        <div className="flex justify-center text-center py-4 border-t border-white/5">
          <Link
            to="/login"
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors focus:outline-none"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
