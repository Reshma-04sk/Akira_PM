import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/data-display";
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm"
    >
      <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email to receive recovery instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                An email containing password reset instructions has been sent. Please check your inbox and spam folders.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors focus:outline-none"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
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

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Send Recovery Instructions
              </Button>
            </form>
          )}
        </CardContent>
        {!success && (
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
