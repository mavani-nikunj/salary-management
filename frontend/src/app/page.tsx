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
  Banknote,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
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
        toast.success("Login successful!");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white mb-4">
            <Banknote className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ACME Payroll System</h1>
          <p className="text-slate-400 text-sm mt-1">Compensation & workforce management portal</p>
        </div>

        {/* Login Card */}
        <Card className="border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="flex flex-col gap-1 pb-0 pt-6 px-6 text-center">
            <h2 className="text-lg font-semibold text-white">HR & Staff Portal Login</h2>
            <p className="text-xs text-slate-400">Enter your official credentials to access the system</p>
          </CardHeader>

          <CardBody className="px-6 py-6">
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
                  inputWrapper: "border-slate-700 hover:border-slate-500 focus-within:border-indigo-500",
                  label: "text-slate-300",
                  input: "text-white",
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
                    className="focus:outline-none text-slate-400 hover:text-slate-200"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                classNames={{
                  inputWrapper: "border-slate-700 hover:border-slate-500 focus-within:border-indigo-500",
                  label: "text-slate-300",
                  input: "text-white",
                }}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Default password: Admin@123</span>
                <Link
                  href="/forgot-password"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={loading}
                className="w-full font-semibold shadow-lg shadow-indigo-600/30 mt-2 bg-indigo-600 hover:bg-indigo-500"
                endContent={!loading && <ArrowRight className="w-4 h-4" />}
              >
                Sign In to Portal
              </Button>
            </form>

            <Divider className="my-6 bg-slate-800" />

            {/* Quick Fill Credentials */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 text-center font-medium">
                Demo Account (Auto Seeded)
              </span>
              <Button
                size="sm"
                variant="flat"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs w-full"
                onPress={handleQuickFill}
              >
                👤 Quick Fill: HR Manager (hr-nick-dev@yopmail.com)
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © ACME Inc. All rights reserved. Encrypted multi-tenant session.
        </p>
      </div>
    </div>
  );
}
