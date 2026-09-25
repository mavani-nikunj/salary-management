"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button, Card, CardBody, Input } from "@heroui/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { LoginCredentials } from "@/type";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const { control, handleSubmit, setValue, clearErrors } =
    useForm<LoginCredentials>({
      defaultValues: {
        email: "",
        password: "",
      },
      mode: "onTouched",
    });

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    setServerError("");

    try {
      const res = await signIn("credentials", {
        email: data.email.trim(),
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setServerError(res.error);
        setIsLoading(false);
      } else {
        router.replace(callbackUrl);
      }
    } catch (err: any) {
      setServerError(
        err.message || "An unexpected error occurred during login.",
      );
      setIsLoading(false);
    }
  };

  const autofillHR = () => {
    setValue("email", "hr-nick-dev@yopmail.com", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("password", "Admin@123", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors();
    setServerError("");
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
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sign in to PayPulse
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Enterprise compensation &amp; payroll management system
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/70 rounded-2xl">
          <CardBody className="p-6 sm:p-7 space-y-5">
            {/* Server Error Alert */}
            {serverError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-medium">{serverError}</div>
              </div>
            )}

            {/* Login Form using Controller with HeroUI Input */}
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
                    label="Work Email"
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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </span>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter your password"
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
                          onClick={toggleVisibility}
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
                {isLoading ? "Signing In..." : "Sign In to Portal"}
              </Button>
            </form>

            {/* Quick autofill HR account */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Fill HR Account:</span>
              </div>
              <button
                type="button"
                onClick={autofillHR}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                    HR Manager
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    hr-nick-dev@yopmail.com
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Multi-tenant secure JWT session encrypted</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
          Loading PayPulse Portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
