"use client";

import { useSession, signOut } from "next-auth/react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import {
  LogOut,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Briefcase,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  const user = session?.user as any;
  const role = (session as any)?.role || user?.role || "User";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Salary Management
              <Chip
                size="sm"
                color="primary"
                variant="flat"
                className="text-[11px] font-semibold"
              >
                Portal
              </Chip>
            </h1>
            <p className="text-xs text-slate-500">
              Enterprise Remuneration &amp; Payroll
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 border border-slate-200/80 rounded-full px-3.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-700 font-medium">
              {user?.email}
            </span>
            <Chip
              size="sm"
              color={role === "Organization" ? "secondary" : "primary"}
              variant="solid"
              className="text-[10px] h-5 font-semibold"
            >
              {role}
            </Chip>
          </div>

          <Button
            size="sm"
            color="danger"
            variant="flat"
            startContent={<LogOut className="w-4 h-4" />}
            onPress={() => signOut({ callbackUrl: "/" })}
            className="font-medium rounded-xl"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-600/15 p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated Session
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || user?.firstName || "HR Manager"}!
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed max-w-xl">
              You are signed in under the{" "}
              <strong className="text-white font-bold">{role}</strong> role. Use
              the portal to oversee compensation budgets, employee records, and
              payroll distribution.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Active Employees
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">10,001</h3>
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3 h-3" /> 100% active
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Monthly Payroll
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">$789.1M</h3>
                <p className="text-[11px] text-blue-600 mt-1 font-medium">
                  Normalized USD total
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Departments
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">10</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Across global divisions
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Briefcase className="w-6 h-6" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardBody className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Your Role</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{role}</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Full management access
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Account Details Box */}
        <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <CardBody className="p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Active Session Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium">
                  Authenticated Email
                </span>
                <p className="font-semibold text-slate-900 mt-1 truncate">
                  {user?.email}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium">
                  Access Scope
                </span>
                <p className="font-semibold text-slate-900 mt-1">
                  {role} Account
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 sm:col-span-2 md:col-span-1">
                <span className="text-xs text-slate-500 font-medium">
                  API Connection
                </span>
                <p className="font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                  Connected (localhost:5022)
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
