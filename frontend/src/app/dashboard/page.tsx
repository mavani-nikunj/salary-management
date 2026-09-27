"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  ButtonGroup,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  Banknote,
  Building2,
  RefreshCw,
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
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { getDashboardDataAction } from "@/services/action/dashboard.action";
import { DashboardData } from "@/type";
import { toast } from "@/Utils/toast";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboardDataAction();
      if (res?.data?.success) {
        setData(res.data.data);
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to load dashboard metrics");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpi = data?.kpis || data?.kpi;
  const charts = data?.charts;
  const recent = data?.recentActivity;

  // Normalized Chart Data
  const monthlyTrendData = (charts?.monthlyPayrollTrend || charts?.monthlyTrend || []).map((m: any) => ({
    month: m.month,
    payroll: currency === "INR" ? (m.totalDisbursed || m.totalPayrollINR || 0) : ((m.totalDisbursed || m.totalPayrollINR || 0) / 95.7),
    revisions: m.revisionsCount || m.count || 0,
  }));

  const departmentData = (charts?.departmentDistribution || []).map((d: any) => ({
    name: d.departmentName || d.department || "General",
    count: d.employeeCount || d.count || 0,
    payroll: d.totalPayroll || d.totalSalaryINR || 0,
  }));

  const levelData = (charts?.levelDistribution || []).map((l: any) => ({
    level: String(l.level).toUpperCase(),
    count: l.employeeCount || l.count || 0,
    payroll: l.totalPayroll || l.avgSalaryINR || 0,
  }));

  const employmentTypeData = (charts?.employmentTypeDistribution || []).map((e: any) => ({
    type: e.type,
    count: e.count,
  }));

  const topRolesData = (charts?.topPayingDesignations || []).map((r: any) => ({
    role: r.jobTitle,
    salary: r.averageSalary,
    count: r.employeeCount,
  }));

  const countryData = (charts?.countryDistribution || []).map((c: any) => ({
    country: c.countryCode || c.countryName || c.country || "Global",
    name: c.countryName || c.countryCode,
    count: c.employeeCount || c.count || 0,
  }));

  const recentHires = recent?.recentHires || [];
  const recentRevisions = recent?.recentSalaryRevisions || recent?.recentRevisions || [];

  const formatCurrency = (val: number = 0) => {
    if (currency === "INR") {
      return `₹${Number(val).toLocaleString("en-IN")}`;
    }
    return `$${Number(val).toLocaleString("en-US")}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 text-sm">
              Real-time multi-currency compensation & workforce intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Dropdown */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-white border border-slate-200 text-slate-800 font-semibold shadow-xs"
                  endContent={<ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                >
                  {currency === "INR" ? "₹ INR" : "$ USD"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Currency Selection"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([currency])}
                onSelectionChange={(keys: any) => {
                  const selected = Array.from(keys)[0] as "INR" | "USD";
                  if (selected) setCurrency(selected);
                }}
              >
                <DropdownItem key="INR" startContent={<span className="font-bold text-indigo-600">₹</span>}>
                  Indian Rupee (INR)
                </DropdownItem>
                <DropdownItem key="USD" startContent={<span className="font-bold text-emerald-600">$</span>}>
                  US Dollar (USD)
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              variant="flat"
              color="default"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onPress={fetchDashboard}
              className="bg-white border border-slate-200 text-slate-700 shadow-xs"
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" color="primary" />
            <p className="text-slate-500 text-sm">Aggregating workforce analytics across 10,000+ records...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12 text-slate-500">No dashboard data available.</div>
        ) : (
          <>
            {/* 13 Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Payroll */}
              <Card className="border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <CardBody className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Monthly Payroll
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {formatCurrency(
                        currency === "INR" ? kpi?.totalMonthlyPayrollINR : kpi?.totalMonthlyPayrollUSD
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {currency === "INR"
                        ? `≈ $${Number(kpi?.totalMonthlyPayrollUSD || 0).toLocaleString()} USD`
                        : `≈ ₹${Number(kpi?.totalMonthlyPayrollINR || 0).toLocaleString()} INR`}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Banknote className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              {/* Card 2: Average Salary */}
              <Card className="border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <CardBody className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Average Monthly Salary
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {formatCurrency(kpi?.averageSalary || kpi?.avgSalaryINR)}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <span>Min: {formatCurrency(kpi?.minSalary || kpi?.minSalaryINR)}</span>
                      <span>•</span>
                      <span>Max: {formatCurrency(kpi?.maxSalary || kpi?.maxSalaryINR)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              {/* Card 3: Headcount */}
              <Card className="border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <CardBody className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Workforce
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {Number(kpi?.totalEmployees || 0).toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px] px-1">
                        {kpi?.activeEmployees} Active
                      </Chip>
                      <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px] px-1">
                        {kpi?.inactiveEmployees || 0} Inactive
                      </Chip>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              {/* Card 4: 30-Day Activity & Velocity */}
              <Card className="border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <CardBody className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      30-Day Velocity
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-emerald-600 flex items-center">
                        <UserPlus className="w-3.5 h-3.5 mr-0.5" /> +{kpi?.newHiresLast30Days || kpi?.newHires30d || 0} Hires
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-sm font-semibold text-rose-600 flex items-center">
                        <UserMinus className="w-3.5 h-3.5 mr-0.5" /> -{kpi?.leaversLast30Days || kpi?.leavers30d || 0} Left
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ⚡ {kpi?.revisionsLast30Days || kpi?.revisions30d || 0} Salary Revisions Logged
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* 6 Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Monthly Payroll Trend */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Monthly Payroll Trend</h3>
                    <p className="text-xs text-slate-400">Total disbursement history by month</p>
                  </div>
                  <Chip size="sm" variant="flat" color="primary">
                    Historical
                  </Chip>
                </CardHeader>
                <CardBody className="px-4 pb-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyTrendData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="#94a3b8"
                          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          formatter={(v: any) => [
                            formatCurrency(v),
                            currency === "INR" ? "Disbursed (INR)" : "Disbursed (USD)",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="payroll"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#payrollGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Chart 2: Department Budget Distribution */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Department Payroll Allocation</h3>
                    <p className="text-xs text-slate-400">Headcount & compensation by department</p>
                  </div>
                </CardHeader>
                <CardBody className="px-4 pb-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          stroke="#94a3b8"
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="#94a3b8"
                          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          formatter={(v: any, name: any) => [
                            name === "count" ? `${v} Staff` : `₹${Number(v).toLocaleString()}`,
                            name === "count" ? "Employees" : "Budget (INR)",
                          ]}
                        />
                        <Bar dataKey="payroll" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Chart 3: Level Distribution */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Seniority Level Breakdown</h3>
                    <p className="text-xs text-slate-400">Employee count & distribution by level</p>
                  </div>
                </CardHeader>
                <CardBody className="px-4 pb-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={levelData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="level" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <Tooltip
                          formatter={(v: any) => [`${v} Employees`, "Headcount"]}
                        />
                        <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Chart 4: Employment Type Donut */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Employment Type Ratio</h3>
                    <p className="text-xs text-slate-400">Full-time, Part-time, Contract & Intern</p>
                  </div>
                </CardHeader>
                <CardBody className="px-4 pb-4 flex items-center justify-center">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={employmentTypeData}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          label={({ type, percent }: any) =>
                            `${type} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {employmentTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Chart 5: Top Paying Roles */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Top Paying Job Roles</h3>
                    <p className="text-xs text-slate-400">Highest average compensation by designation</p>
                  </div>
                </CardHeader>
                <CardBody className="px-4 pb-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={topRolesData}
                        margin={{ top: 10, right: 20, left: 60, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11 }}
                          stroke="#94a3b8"
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="role"
                          tick={{ fontSize: 10 }}
                          stroke="#94a3b8"
                          width={110}
                        />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Avg Salary"]} />
                        <Bar dataKey="salary" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Chart 6: Country Distribution */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="flex justify-between items-center px-6 pt-5 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Top Countries by Headcount</h3>
                    <p className="text-xs text-slate-400">Global distributed employee footprint</p>
                  </div>
                </CardHeader>
                <CardBody className="px-4 pb-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={countryData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="country"
                          tick={{ fontSize: 10 }}
                          stroke="#94a3b8"
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <Tooltip
                          formatter={(v: any, _, item: any) => [
                            `${v} Employees`,
                            item?.payload?.name || "Country",
                          ]}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Live Activity Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feed 1: Recent Hires */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="px-6 pt-5 pb-2 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 text-sm">Recent Onboarded Employees</h3>
                  <Chip size="sm" variant="flat" color="success">
                    Latest 5
                  </Chip>
                </CardHeader>
                <CardBody className="px-6 py-2">
                  <div className="divide-y divide-slate-100">
                    {recentHires.map((emp) => (
                      <div key={emp._id} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                            {emp.fullName?.[0] || emp.firstName?.[0] || "E"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()}
                            </p>
                            <p className="text-xs text-slate-400">
                              {emp.employeeCode} • {emp.departmentName || emp.department?.name || "General"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : "Recently"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Feed 2: Recent Salary Revisions */}
              <Card className="border border-slate-200/80 shadow-xs">
                <CardHeader className="px-6 pt-5 pb-2 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 text-sm">Recent Salary Adjustments</h3>
                  <Chip size="sm" variant="flat" color="warning">
                    Ledger Activity
                  </Chip>
                </CardHeader>
                <CardBody className="px-6 py-2">
                  <div className="divide-y divide-slate-100">
                    {recentRevisions.map((rev) => (
                      <div key={rev._id} className="py-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-slate-800">
                            {rev.employeeName || `${rev.employee?.firstName || ""} ${rev.employee?.lastName || ""}`.trim() || rev.employeeCode}
                          </p>
                          <p className="text-xs text-slate-400">
                            Effective:{" "}
                            {rev.effectiveDate
                              ? new Date(rev.effectiveDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">
                            {rev.currencyCode || "INR"}{" "}
                            {Number(rev.paySalary).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-400">Approved Revision</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
