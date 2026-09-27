"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardBody,
  Input,
  Button,
} from "@heroui/react";
import { Banknote, Lock, ArrowLeft, KeyRound } from "lucide-react";
import { CallResetPassword } from "@/services/action/auth.action";
import { toast } from "@/Utils/toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await CallResetPassword({ token, password });
      if (res?.success) {
        toast.success("Password reset successful! You can now log in.");
        router.push("/");
      } else {
        toast.error(res?.message || "Failed to reset password.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
      <CardBody className="px-6 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            label="New Password"
            placeholder="At least 6 characters"
            variant="bordered"
            value={password}
            onValueChange={setPassword}
            startContent={<Lock className="w-4 h-4 text-slate-400" />}
            classNames={{
              inputWrapper: "border-slate-700 hover:border-slate-500 focus-within:border-indigo-500",
              label: "text-slate-300",
              input: "text-white",
            }}
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter password"
            variant="bordered"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            startContent={<Lock className="w-4 h-4 text-slate-400" />}
            classNames={{
              inputWrapper: "border-slate-700 hover:border-slate-500 focus-within:border-indigo-500",
              label: "text-slate-300",
              input: "text-white",
            }}
            required
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-semibold shadow-lg shadow-indigo-600/30 mt-2 bg-indigo-600 hover:bg-indigo-500"
            endContent={!loading && <KeyRound className="w-4 h-4" />}
          >
            Update Password
          </Button>

          <div className="text-center mt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white mb-4">
            <Banknote className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your new secure password below</p>
        </div>

        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
