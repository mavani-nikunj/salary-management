"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Button,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import {
  TrendingUp,
  Banknote,
  Building2,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Star,
  Users,
  Plus,
  Minus,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Share2,
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
  CartesianGrid,
  ComposedChart,
  Line,
} from "recharts";
import { getDashboardDataAction } from "@/services/action/dashboard.action";
import { DashboardData } from "@/type";
import { toast } from "@/Utils/toast";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"INR" | "USD">("USD");
  const [period, setPeriod] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Monthly");

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

  const formatCurrency = (val: number = 0) => {
    if (currency === "INR") {
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    const inUSD = currency === "USD" ? val / 95.7 : val;
    return `$${Math.round(inUSD).toLocaleString("en-US")}`;
  };

  // Follower Growth Combo Chart Data (Nov 2 - 30)
  const growthComboData = [
    { day: "2", bar: 45, line: 55 },
    { day: "4", bar: 62, line: 60 },
    { day: "6", bar: 38, line: 42 },
    { day: "8", bar: 65, line: 62 },
    { day: "10", bar: 40, line: 40 },
    { day: "12", bar: 48, line: 38 },
    { day: "14", bar: 63, line: 61 },
    { day: "16", bar: 44, line: 49 },
    { day: "18", bar: 39, line: 41 },
    { day: "20", bar: 50, line: 48 },
    { day: "22", bar: 61, line: 60 },
    { day: "24", bar: 66, line: 65 },
    { day: "26", bar: 78, line: 62 },
    { day: "28", bar: 68, line: 66 },
    { day: "30", bar: 72, line: 70 },
  ];

  // Traffic / Department Donut Data
  const trafficData = [
    { name: "Facebook", value: 38, color: "#1890FF" },
    { name: "LinkedIn", value: 25, color: "#00B96B" },
    { name: "X", value: 18, color: "#1E293B" },
    { name: "Instagram", value: 12, color: "#F59E0B" },
    { name: "YouTube", value: 7, color: "#EF4444" },
  ];

  // Table rows matching reference design
  const tableData = [
    {
      platform: "Facebook",
      id: "#Fb89767",
      iconColor: "text-blue-600 bg-blue-50",
      gained: "654",
      total: "12,854",
      date: "15 Nov 2025",
      growth: "+3.4%",
      isPositive: true,
    },
    {
      platform: "YouTube",
      id: "#Yt46793",
      iconColor: "text-rose-600 bg-rose-50",
      gained: "501",
      total: "6,365",
      date: "15 Nov 2025",
      growth: "-1.6%",
      isPositive: false,
    },
    {
      platform: "Instagram",
      id: "#In96744",
      iconColor: "text-pink-600 bg-pink-50",
      gained: "352",
      total: "15,259",
      date: "15 Nov 2025",
      growth: "+1.9%",
      isPositive: true,
    },
    {
      platform: "X",
      id: "#X574567",
      iconColor: "text-slate-800 bg-slate-100",
      gained: "230",
      total: "10,963",
      date: "15 Nov 2025",
      growth: "+2.6%",
      isPositive: true,
    },
    {
      platform: "LinkedIn",
      id: "#Ld73563",
      iconColor: "text-sky-600 bg-sky-50",
      gained: "196",
      total: "8,453",
      date: "15 Nov 2025",
      growth: "+1.8%",
      isPositive: true,
    },
  ];

  // Recent activities list from reference image
  const recentActivities = [
    {
      name: "Sofia Rahman",
      role: "UX Designer",
      roleColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
      rating: "9.0",
      time: "08:25  2 mins ago",
      avatarBg: "bg-emerald-500",
      ringColor: "ring-emerald-400",
    },
    {
      name: "Omar Hossain",
      role: "Project Lead",
      roleColor: "text-blue-600 bg-blue-50 border-blue-100",
      rating: "8.9",
      time: "10:00  20 mins ago",
      avatarBg: "bg-blue-500",
      ringColor: "ring-blue-400",
    },
    {
      name: "Lily Carter",
      role: "QA Specialist",
      roleColor: "text-sky-600 bg-sky-50 border-sky-100",
      rating: "8.7",
      time: "11:32  30 mins ago",
      avatarBg: "bg-cyan-500",
      ringColor: "ring-cyan-400",
    },
    {
      name: "Guadalupe Chen",
      role: "DevOps Specialist",
      roleColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      rating: "8.5",
      time: "13:11  55 mins ago",
      avatarBg: "bg-amber-500",
      ringColor: "ring-amber-400",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        
        {/* Currency & Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 px-5 rounded-xl border border-slate-100 shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Workforce Intelligence Overview
            </span>
            <p className="text-sm font-semibold text-slate-800">
              Live Real-Time Multi-Currency Ledger
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency Selector */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-xs"
                  endContent={<ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                >
                  {currency === "USD" ? "$ USD (United States)" : "₹ INR (Indian Rupee)"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Currency"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([currency])}
                onSelectionChange={(keys: any) => {
                  const selected = Array.from(keys)[0] as "INR" | "USD";
                  if (selected) setCurrency(selected);
                }}
              >
                <DropdownItem key="USD" startContent={<span className="font-bold text-blue-600">$</span>}>
                  US Dollar (USD)
                </DropdownItem>
                <DropdownItem key="INR" startContent={<span className="font-bold text-indigo-600">₹</span>}>
                  Indian Rupee (INR)
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onPress={fetchDashboard}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl shadow-xs font-medium"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* SECTION 1: TOP 5 METRIC CARDS (SOCIAL/CHANNEL STYLE) */}
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-3 px-1">Social Media</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            
            {/* Card 1: Facebook */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-xs">
                    f
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Facebook</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  +3.4%
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 tracking-tight">12,854</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Followers</p>
            </div>

            {/* Card 2: LinkedIn */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-sky-50 text-sky-600 font-bold text-xs">
                    in
                  </div>
                  <span className="text-xs font-semibold text-slate-700">LinkedIn</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  +1.8%
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 tracking-tight">8,453</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Connections</p>
            </div>

            {/* Card 3: Instagram */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-pink-50 text-pink-500 font-bold text-xs">
                    ig
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Instagram</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  +1.9%
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 tracking-tight">15,259</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Followers</p>
            </div>

            {/* Card 4: X */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-800 font-bold text-xs">
                    𝕏
                  </div>
                  <span className="text-xs font-semibold text-slate-700">X</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  +2.6%
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 tracking-tight">10,963</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Followers</p>
            </div>

            {/* Card 5: YouTube */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-rose-50 text-rose-600 font-bold text-xs">
                    ▶
                  </div>
                  <span className="text-xs font-semibold text-slate-700">YouTube</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                  -1.6%
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 tracking-tight">6,365</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Followers</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: 4 FINANCIAL SPARKLINE CARDS + RECENT ACTIVITIES + TRAFFIC DONUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT 4-PACK: SPARKLINE STAT CARDS (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Sparkline 1: Monthly Earning */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">$265,856</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Monthly Earning</p>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Smooth Blue Wave */}
              <div className="h-12 w-full mt-3">
                <svg viewBox="0 0 160 40" className="w-full h-full overflow-visible">
                  <path
                    d="M0,28 Q20,10 40,25 T80,18 T120,24 T160,10"
                    fill="none"
                    stroke="#1890FF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Sparkline 2: Net Profit */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">$65,256</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Net Profit</p>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Smooth Green Wave */}
              <div className="h-12 w-full mt-3">
                <svg viewBox="0 0 160 40" className="w-full h-full overflow-visible">
                  <path
                    d="M0,22 Q20,32 40,12 T80,26 T120,15 T160,20"
                    fill="none"
                    stroke="#00B96B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Sparkline 3: Total Sales */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">$250,984</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Total Sales</p>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Smooth Cyan/Blue Wave */}
              <div className="h-12 w-full mt-3">
                <svg viewBox="0 0 160 40" className="w-full h-full overflow-visible">
                  <path
                    d="M0,30 Q20,18 40,24 T80,12 T120,28 T160,18"
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Sparkline 4: Total Expenses */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">$96,123</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Total Expenses</p>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              {/* Smooth Orange Wave */}
              <div className="h-12 w-full mt-3">
                <svg viewBox="0 0 160 40" className="w-full h-full overflow-visible">
                  <path
                    d="M0,20 Q20,35 40,20 T80,32 T120,16 T160,25"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* MIDDLE: RECENT ACTIVITIES (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Recent Activities</h3>
              <button
                onClick={() => toast.info("Showing live activity records")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                See All
              </button>
            </div>

            <div className="space-y-3.5 my-2">
              {recentActivities.map((act) => (
                <div key={act.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${act.avatarBg} text-white font-bold flex items-center justify-center ring-2 ${act.ringColor} ring-offset-1 shrink-0`}>
                      {act.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{act.name}</p>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${act.roleColor}`}>
                        {act.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-amber-500 font-bold text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{act.rating}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Real-time feed sync</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>

          {/* RIGHT: TRAFFIC DONUT CHART (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <h3 className="font-bold text-sm text-slate-800">Traffic</h3>

            {/* Donut Chart with Center Text */}
            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-slate-900 leading-none">100%</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Total Traffic</span>
              </div>
            </div>

            {/* Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1890FF]"></span> Facebook
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00B96B]"></span> LinkedIn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1E293B]"></span> X
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Instagram
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> YouTube
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: COMBO GROWTH CHART & CAMPAIGN GAUGES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* COMBO CHART (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Facebook Follower Growth</h3>
                <p className="text-xs text-slate-400">Monthly breakdown and cumulative distribution</p>
              </div>

              {/* Period Switcher Pills */}
              <div className="inline-flex p-1 bg-slate-50 rounded-xl border border-slate-100 self-start sm:self-auto">
                {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      period === p
                        ? "bg-[#1890FF] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Combo Chart Container */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthComboData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                    formatter={(val: any, name: any) => [
                      `${val}% Growth`,
                      name === "bar" ? "Disbursed Target" : "Trajectory Rate",
                    ]}
                  />
                  {/* Soft light rounded bars */}
                  <Bar dataKey="bar" fill="#BAE7FF" radius={[6, 6, 0, 0]} maxBarSize={18} />
                  {/* Smooth curved blue line with point markers */}
                  <Line
                    type="monotone"
                    dataKey="line"
                    stroke="#1890FF"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#1890FF", stroke: "#FFFFFF", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#0050B3" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-400 text-left pt-2 font-medium">
              Nov: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30
            </div>
          </div>

          {/* CAMPAIGN CARD (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Facebook Campaign</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Facebook latest campaign focuses on driving engagement and brand
              </p>
            </div>

            {/* Dual Gauges */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* Gauge 1: Posts */}
              <div className="bg-[#F6FFED] rounded-xl p-3.5 border border-[#B7EB8F]/40 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800">752</span>
                <span className="text-[10px] text-slate-400">Posts</span>
                
                {/* Mini Circle SVG */}
                <div className="relative w-16 h-16 my-2 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      className="text-emerald-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray="75, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-bold text-slate-800 leading-none">752</span>
                    <span className="text-[8px] text-slate-400">Total</span>
                  </div>
                </div>
              </div>

              {/* Gauge 2: Engagement */}
              <div className="bg-[#F0F5FF] rounded-xl p-3.5 border border-[#ADC6FF]/40 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800">79%</span>
                <span className="text-[10px] text-slate-400">Engagement</span>

                {/* Mini Circle SVG */}
                <div className="relative w-16 h-16 my-2 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      className="text-blue-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      strokeDasharray="79, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-bold text-slate-800 leading-none">79%</span>
                    <span className="text-[8px] text-slate-400">Total 100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Avatars & Followers */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                  S
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                  O
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                  L
                </div>
                <div className="w-7 h-7 rounded-full bg-rose-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                  G
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">+12,854</p>
                <p className="text-[10px] text-slate-400">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: DATA TABLE & COUNTRY DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* FOLLOWER GROWTH TABLE (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Follower Growth</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Platform ID</th>
                    <th className="py-2.5 px-3">Gained</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Growth%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {tableData.map((row) => (
                    <tr key={row.platform} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-800 flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${row.iconColor}`}>
                          {row.platform[0]}
                        </span>
                        {row.platform}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{row.id}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{row.gained}</td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">{row.total}</td>
                      <td className="py-3 px-3 text-slate-400">{row.date}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            row.isPositive
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {row.growth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOLLOWER BY COUNTRY (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-3">Follower by Country</h3>

              {/* Stylized Vector World Map Container */}
              <div className="relative w-full h-36 bg-gradient-to-b from-sky-50/80 to-blue-50/40 rounded-xl border border-sky-100/60 overflow-hidden flex items-center justify-center p-2">
                <svg viewBox="0 0 300 150" className="w-full h-full opacity-80">
                  {/* North America */}
                  <path
                    d="M30,30 Q45,20 65,30 T85,55 T65,80 T40,65 Z"
                    fill="#93C5FD"
                    opacity="0.8"
                  />
                  {/* South America */}
                  <path
                    d="M75,90 Q90,95 85,120 T70,140 T65,110 Z"
                    fill="#93C5FD"
                    opacity="0.8"
                  />
                  {/* Europe */}
                  <path
                    d="M130,30 Q150,25 160,45 T145,65 T130,50 Z"
                    fill="#60A5FA"
                    opacity="0.8"
                  />
                  {/* Africa */}
                  <path
                    d="M135,70 Q160,70 165,100 T145,125 T130,95 Z"
                    fill="#93C5FD"
                    opacity="0.8"
                  />
                  {/* Asia */}
                  <path
                    d="M175,25 Q230,20 250,55 T230,85 T180,60 Z"
                    fill="#60A5FA"
                    opacity="0.8"
                  />
                  {/* Australia */}
                  <path
                    d="M225,105 Q250,105 245,125 T220,130 Z"
                    fill="#93C5FD"
                    opacity="0.8"
                  />
                  {/* Location Pulse Markers */}
                  <circle cx="55" cy="45" r="3.5" fill="#EF4444" className="animate-ping" />
                  <circle cx="55" cy="45" r="3" fill="#EF4444" />

                  <circle cx="145" cy="80" r="3.5" fill="#EF4444" className="animate-ping" />
                  <circle cx="145" cy="80" r="3" fill="#EF4444" />

                  <circle cx="205" cy="65" r="3.5" fill="#EF4444" className="animate-ping" />
                  <circle cx="205" cy="65" r="3" fill="#EF4444" />

                  <circle cx="235" cy="115" r="3.5" fill="#EF4444" className="animate-ping" />
                  <circle cx="235" cy="115" r="3" fill="#EF4444" />
                </svg>

                {/* Map Zoom Controls Pill */}
                <div className="absolute right-2 top-2 bg-white/90 backdrop-blur-xs rounded-md shadow-xs border border-slate-200/60 flex flex-col">
                  <button className="px-1.5 py-0.5 text-xs text-slate-600 hover:text-slate-900 border-b border-slate-100">
                    +
                  </button>
                  <button className="px-1.5 py-0.5 text-xs text-slate-600 hover:text-slate-900">
                    -
                  </button>
                </div>
              </div>
            </div>

            {/* Country Metric Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-50 text-xs">
              {/* Canada */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇨🇦</span>
                  <span className="font-semibold text-slate-800">Canada</span>
                </div>
                <span className="text-slate-500 font-bold">21.5k</span>
              </div>

              {/* Morocco */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇲🇦</span>
                  <span className="font-semibold text-slate-800">Morocco</span>
                </div>
                <span className="text-slate-500 font-bold">16.9k</span>
              </div>

              {/* Australia */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇦🇺</span>
                  <span className="font-semibold text-slate-800">Australia</span>
                </div>
                <span className="text-slate-500 font-bold">12.6k</span>
              </div>

              {/* India */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇮🇳</span>
                  <span className="font-semibold text-slate-800">India</span>
                </div>
                <span className="text-slate-500 font-bold">25.6k</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
