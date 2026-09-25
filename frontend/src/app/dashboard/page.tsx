"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Menu,
  ArrowUpRight,
  UserPlus,
  RefreshCw,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import { CallGetDashboard } from "@/services/action/dashboard.action";

const LEVEL_COLORS: Record<string, string> = {
  junior: "#60a5fa", // blue-400
  mid: "#3b82f6", // blue-500
  senior: "#6366f1", // indigo-500
  lead: "#8b5cf6", // purple-500
  manager: "#f59e0b", // amber-500
};

const EMP_TYPE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currencyMode, setCurrencyMode] = useState<"USD" | "INR">("USD");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res: any = await CallGetDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  if (status === "loading" || (isLoading && !dashboardData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-slate-500 font-medium">
            Loading analytics dashboard...
          </p>
        </div>
      </div>
    );
  }

  const user = session?.user as any;
  const role = (session as any)?.role || user?.role || "HR";

  const kpis = dashboardData?.kpis || {};
  const charts = dashboardData?.charts || {};

  // Formatted chart data
  const monthlyTrendData = (charts.monthlyPayrollTrend || []).map(
    (item: any) => ({
      month: item.month,
      revisions: item.revisionCount || 0,
      payrollUSD: Math.round((item.totalDisbursedUSD || item.totalDisbursedNominal / 82) * 10) / 10,
      payrollINR: Math.round((item.totalDisbursedINR || item.totalDisbursedNominal) / 1000000), // in Millions
    }),
  );

  const deptData = (charts.departmentDistribution || []).map((item: any) => ({
    name: item.departmentName || item.name || "Dept",
    count: item.employeeCount || 0,
    payrollM: Math.round((item.totalPayroll || 0) / 1000000),
  }));

  const levelData = (charts.levelDistribution || []).map((item: any) => ({
    name:
      (item.level || item._id || "Level").charAt(0).toUpperCase() +
      (item.level || item._id || "").slice(1),
    value: item.employeeCount || item.count || 0,
    rawLevel: item.level || item._id,
  }));

  const empTypeData = (charts.employmentTypeDistribution || []).map(
    (item: any) => ({
      name: item.type || item._id || "Type",
      count: item.count || 0,
    }),
  );

  const formatCurrency = (valUSD: number, valINR: number) => {
    if (currencyMode === "USD") {
      if (valUSD >= 1_000_000) {
        return `$${(valUSD / 1_000_000).toFixed(1)}M`;
      }
      return `$${valUSD.toLocaleString()}`;
    } else {
      if (valINR >= 10_000_000) {
        return `₹${(valINR / 10_000_000).toFixed(1)} Cr`;
      }
      return `₹${valINR.toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Executive Dashboard
                <Chip size="sm" color="primary" variant="flat" className="text-[10px] font-semibold h-5">
                  Live
                </Chip>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Overview of compensation, payroll distribution, and workforce metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="bordered"
                  endContent={<ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  className="font-semibold text-xs border-slate-200 bg-white rounded-xl shadow-sm min-w-28"
                >
                  {currencyMode === "USD" ? "USD ($)" : "INR (₹)"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Currency selection"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([currencyMode])}
                onSelectionChange={(keys: any) => {
                  const selected = Array.from(keys)[0] as "USD" | "INR";
                  if (selected) setCurrencyMode(selected);
                }}
              >
                <DropdownItem key="USD" description="US Dollar (Normalized)">
                  USD ($)
                </DropdownItem>
                <DropdownItem key="INR" description="Indian Rupee (Base)">
                  INR (₹)
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              onPress={loadData}
              className="font-medium text-xs rounded-xl"
            >
              Refresh
            </Button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/10 p-6 sm:p-7">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Authenticated as {role}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Welcome back, {user?.name || user?.firstName || "HR Manager"}!
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Managing <strong>{kpis.totalEmployees?.toLocaleString() || "10,001"}</strong> employees across{" "}
                <strong>{kpis.totalDepartments || "10"}</strong> departments with an estimated monthly budget of{" "}
                <strong>{formatCurrency(kpis.totalMonthlyPayrollUSD || 0, kpis.totalMonthlyPayrollINR || 0)}</strong>.
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          </div>

          {/* 4 Core KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Headcount */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardBody className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Headcount</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {kpis.totalEmployees?.toLocaleString() || "10,001"}
                  </h3>
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    {kpis.activeEmployees?.toLocaleString()} Active (100%)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </CardBody>
            </Card>

            {/* Card 2: Monthly Payroll */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardBody className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Monthly Payroll</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(kpis.totalMonthlyPayrollUSD || 0, kpis.totalMonthlyPayrollINR || 0)}
                  </h3>
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    {currencyMode === "USD" ? "Normalized USD total" : "Consolidated INR total"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </CardBody>
            </Card>

            {/* Card 3: Average Compensation */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardBody className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Average Salary</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(
                      (kpis.totalMonthlyPayrollUSD || 0) / (kpis.totalEmployees || 1),
                      kpis.averageSalary || 0,
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Min: {formatCurrency(300, kpis.minSalary || 0)} / Max: {formatCurrency(300000, kpis.maxSalary || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Briefcase className="w-6 h-6" />
                </div>
              </CardBody>
            </Card>

            {/* Card 4: 30-Day Activity */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardBody className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">30-Day Activity</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    +{kpis.newHiresLast30Days || 0} Hires
                  </h3>
                  <p className="text-[11px] text-indigo-600 mt-1 font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {kpis.revisionsLast30Days || 0} salary revisions
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <UserPlus className="w-6 h-6" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row 1: Monthly Trend & Department Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Monthly Payroll Trend */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardHeader className="p-5 pb-0 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Payroll Disbursement Trend
                  </h4>
                  <p className="text-xs text-slate-400">Monthly revision activity over time</p>
                </div>
              </CardHeader>
              <CardBody className="p-5 pt-3">
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={currencyMode === "USD" ? "payrollUSD" : "payrollINR"}
                        name={currencyMode === "USD" ? "Payroll ($USD)" : "Payroll (₹M)"}
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#payrollGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Chart 2: Department Headcount */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardHeader className="p-5 pb-0 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Department Headcount
                  </h4>
                  <p className="text-xs text-slate-400">Employee count across corporate departments</p>
                </div>
              </CardHeader>
              <CardBody className="p-5 pt-3">
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-25} textAnchor="end" height={45} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" name="Employees" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row 2: Seniority Levels & Employment Type */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 3: Level Distribution */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl lg:col-span-2">
              <CardHeader className="p-5 pb-0">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-600" />
                    Workforce Seniority Breakdown
                  </h4>
                  <p className="text-xs text-slate-400">Headcount distribution by career level</p>
                </div>
              </CardHeader>
              <CardBody className="p-5 pt-3">
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={levelData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {levelData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={LEVEL_COLORS[entry.rawLevel] || "#3b82f6"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Chart 4: Employment Type */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl">
              <CardHeader className="p-5 pb-0">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Employment Type
                  </h4>
                  <p className="text-xs text-slate-400">Contractual terms ratio</p>
                </div>
              </CardHeader>
              <CardBody className="p-5 pt-3">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={empTypeData} layout="vertical" margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" name="Staff" fill="#10b981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
