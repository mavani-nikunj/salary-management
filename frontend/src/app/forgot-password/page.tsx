"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Input,
  Button,
} from "@heroui/react";
import { Banknote, Mail, ArrowLeft, Send } from "lucide-react";
import { CallForgotPassword } from "@/services/action/auth.action";
import { toast } from "@/Utils/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await CallForgotPassword({ email });
      if (res?.success) {
        setSubmitted(true);
        toast.success(res.message || "Password reset instructions sent!");
      } else {
        toast.error(res?.message || "Failed to process request.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white mb-4">
            <Banknote className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        <Card className="border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardBody className="px-6 py-8">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
                  If an account exists for <span className="font-semibold">{email}</span>, a password
                  reset link has been dispatched to your inbox.
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  type="email"
                  label="Registered Email"
                  placeholder="name@company.com"
                  variant="bordered"
                  value={email}
                  onValueChange={setEmail}
                  startContent={<Mail className="w-4 h-4 text-slate-400" />}
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
                  endContent={!loading && <Send className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>

                <div className="text-center mt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
