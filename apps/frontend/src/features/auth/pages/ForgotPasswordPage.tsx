import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { toast } from "@/components/ui/feedback";
import { authApi } from "@/services/api/auth.api";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type SchemaType = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: SchemaType) => {
    try {
      setLoading(true);
      await authApi.forgotPassword(data.email);
      
      toast.success("Request submitted", "Check your email for reset instructions.");
      setSuccess(true);
    } catch (error: any) {
      toast.error("Failed to submit request", error.message || "An unexpected error occurred");
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
          Forgot password?
        </h1>
        <p className="text-[11px] text-[#707070] font-mono uppercase tracking-widest">
          AKIRA PM — Account Recovery
        </p>
      </div>

      {/* Auth Card */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                An email containing password reset instructions has been sent. Please check your inbox and spam folders.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-[#f5f5f3] text-black text-xs font-semibold hover:bg-white transition-colors focus:outline-none"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Send Recovery Instructions
              </Button>
            </form>
          )}
        </div>
        {!success && (
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
