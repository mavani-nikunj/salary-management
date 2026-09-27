"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
} from "@heroui/react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/Utils/toast";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Welcome back! Login successful.");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("hr-nick-dev@yopmail.com");
    setPassword("Admin@123");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EAECE7] p-4 font-sans text-slate-800">
      <div className="w-full max-w-md">
        
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-300 p-1 items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <div className="flex items-end gap-1 h-5">
                <span className="w-1.5 h-2.5 bg-sky-400 rounded-xs"></span>
                <span className="w-1.5 h-4.5 bg-blue-500 rounded-xs"></span>
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs"></span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salary Management</h1>
          <p className="text-slate-500 text-xs mt-1">Workforce Compensation & Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl border border-black/[0.04]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter your official credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@company.com"
              variant="bordered"
              value={email}
              onValueChange={setEmail}
              startContent={<Mail className="w-4 h-4 text-slate-400" />}
              classNames={{
                inputWrapper: "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 rounded-xl",
                label: "text-slate-600 text-xs font-medium",
                input: "text-slate-800 text-sm",
              }}
              required
            />

            <Input
              type={isVisible ? "text" : "password"}
              label="Password"
              placeholder="Enter password"
              variant="bordered"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="w-4 h-4 text-slate-400" />}
              endContent={
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="focus:outline-none text-slate-400 hover:text-slate-600"
                >
                  {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              classNames={{
                inputWrapper: "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 rounded-xl",
                label: "text-slate-600 text-xs font-medium",
                input: "text-slate-800 text-sm",
              }}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Default: Admin@123</span>
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="w-full font-semibold shadow-md shadow-blue-500/25 mt-2 bg-[#1890FF] hover:bg-blue-600 text-white rounded-xl"
              endContent={!loading && <ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Demo Access</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          {/* Quick Fill Credentials */}
          <Button
            size="sm"
            variant="flat"
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs rounded-xl font-medium"
            onPress={handleQuickFill}
          >
            👤 Quick Fill Demo: HR Manager
          </Button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 mt-6 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted session • Salary Management</span>
        </div>
      </div>
    </div>
  );
}
