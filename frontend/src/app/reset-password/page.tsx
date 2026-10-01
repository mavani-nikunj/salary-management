"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { Card, CardBody, Button, Input } from "@heroui/react";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import { CallResetPassword } from "@/services/action/auth.action";

interface ResetFormValues {
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit } = useForm<ResetFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken.trim());
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      setServerError(
        "Invalid or missing reset token. Please request a new password reset link.",
      );
      return;
    }

    setServerError("");
    setIsLoading(true);

    try {
      const res: any = await CallResetPassword({
        token,
        newPassword: data.newPassword,
      });

      if (res.code === 200 || res.success) {
        setIsSuccess(true);
      } else {
        setServerError(
          res.message ||
            "Failed to reset password. The link may be expired or invalid.",
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

  return (
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
          Choose a strong password with at least 6 characters to secure your account.
        </p>
      </div>

      {/* Main Card */}
      <Card className="border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/70 rounded-2xl">
        <CardBody className="p-6 sm:p-7 space-y-5">
          {/* Missing Token Warning */}
          {!token && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">
                  Missing Reset Token
                </p>
                <p className="mt-0.5 text-amber-700">
                  No verification token found in the URL. Please ensure you
                  opened the complete link sent to your email.
                </p>
              </div>
            </div>
          )}

          {/* Server Error Alert */}
          {serverError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium">{serverError}</div>
            </div>
          )}

          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-blue-950">
                  Password Reset Complete!
                </h3>
                <p className="text-blue-700">
                  Your account password has been updated successfully. You can
                  now sign in using your new credentials.
                </p>
              </div>

              <Button
                onPress={() => router.push("/")}
                color="primary"
                size="lg"
                radius="lg"
                fullWidth
                endContent={<ArrowRight className="w-4 h-4" />}
                className="font-semibold shadow-md shadow-blue-600/25"
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            /* Reset Form with only Password and Confirm Password */
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  New Password
                </span>
                <Controller
                  name="newPassword"
                  control={control}
                  rules={{
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Minimum 6 characters"
                      type={isVisible ? "text" : "password"}
                      variant="bordered"
                      size="md"
                      radius="lg"
                      isInvalid={!!error}
                      errorMessage={error?.message}
                      startContent={
                        <Lock className="w-4 h-4 text-default-400 pointer-events-none shrink-0" />
                      }
                      endContent={
                        <button
                          type="button"
                          onClick={() => setIsVisible(!isVisible)}
                          className="focus:outline-none text-default-400 hover:text-default-600"
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </span>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Please confirm your password",
                    validate: (val, formValues) =>
                      val === formValues.newPassword ||
                      "Passwords do not match",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Repeat new password"
                      type={isConfirmVisible ? "text" : "password"}
                      variant="bordered"
                      size="md"
                      radius="lg"
                      isInvalid={!!error}
                      errorMessage={error?.message}
                      startContent={
                        <Lock className="w-4 h-4 text-default-400 pointer-events-none shrink-0" />
                      }
                      endContent={
                        <button
                          type="button"
                          onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                          className="focus:outline-none text-default-400 hover:text-default-600"
                        >
                          {isConfirmVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />
                  )}
                />
              </div>

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
                {isLoading ? "Updating Password..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          {!isSuccess && (
            <div className="pt-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Security Footer Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        <span>Bcrypt salted password encryption standard</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Light Theme Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-sky-100/60 rounded-full blur-3xl" />
      </div>

      <Suspense
        fallback={
          <div className="text-slate-500 text-sm animate-pulse">
            Loading reset portal...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
