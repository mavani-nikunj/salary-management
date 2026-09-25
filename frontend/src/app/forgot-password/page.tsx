"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { CallForgotPassword } from "@/services/action/auth.action";
import { ForgotPasswordPayload } from "@/type";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const { control, handleSubmit, setValue, clearErrors } =
    useForm<ForgotPasswordPayload>({
      defaultValues: {
        email: "",
      },
      mode: "onTouched",
    });

  const onSubmit = async (data: ForgotPasswordPayload) => {
    setIsLoading(true);
    setServerError("");
    setSuccessMessage("");
    setDevResetToken(null);

    try {
      const res: any = await CallForgotPassword({ email: data.email.trim() });
      if (res.code === 200 || res.success) {
        setSuccessMessage(
          res.message ||
            "If that email address is registered, password reset instructions have been sent.",
        );
        if (res.data?.resetToken) {
          setDevResetToken(res.data.resetToken);
        }
      } else {
        setServerError(
          res.message || "Failed to process your request. Please try again.",
        );
      }
    } catch (err: any) {
      setServerError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillHR = () => {
    setValue("email", "hr-nick-dev@yopmail.com", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors();
    setServerError("");
    setSuccessMessage("");
    setDevResetToken(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Light Theme Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-sky-100/60 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white mb-1">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Enter your registered work email and we&apos;ll send you
            instructions to reset your account credentials.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/70 rounded-2xl">
          <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Forgot Your Password?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure reset link will expire in 1 hour
            </p>
          </CardHeader>

          <CardBody className="px-6 py-4 space-y-5">
            {/* Server Error Alert */}
            {serverError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-medium">{serverError}</div>
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-bold text-blue-950">
                      Reset Instructions Dispatched
                    </p>
                    <p className="mt-1 text-blue-700">{successMessage}</p>
                  </div>
                </div>

                {devResetToken && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Development Environment Shortcut:</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Generated reset token:{" "}
                      <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-mono text-[10px] break-all select-all">
                        {devResetToken}
                      </code>
                    </p>
                    <Link
                      href={`/reset-password?token=${devResetToken}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
                    >
                      <span>Continue to Reset Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Form using Controller with HeroUI Input */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Work email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    value={field.value || ""}
                    label="Work Email Address"
                    labelPlacement="outside"
                    placeholder="name@company.com"
                    type="email"
                    variant="bordered"
                    size="md"
                    radius="lg"
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    startContent={
                      <Mail className="w-4 h-4 text-default-400 pointer-events-none shrink-0" />
                    }
                  />
                )}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                color="primary"
                size="lg"
                radius="lg"
                fullWidth
                endContent={!isLoading && <ArrowRight className="w-4 h-4" />}
                className="font-semibold shadow-md shadow-blue-600/25"
              >
                {isLoading ? "Sending Instructions..." : "Send Reset Link"}
              </Button>
            </form>

            {/* Quick autofill helper */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Account:</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFillHR}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all text-xs cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                    HR Manager
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    hr-nick-dev@yopmail.com
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
              </button>
            </div>

            {/* Back to Login */}
            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Encrypted token generation with 1-hour expiry</span>
        </div>
      </div>
    </div>
  );
}
