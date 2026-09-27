"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Divider,
} from "@heroui/react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Filter,
  RefreshCw,
  Building2,
  TrendingUp,
} from "lucide-react";
import {
  getReportsDepartmentsAction,
  getReportsPayrollHistoryAction,
  getReportsOverviewAction,
} from "@/services/action/dashboard.action";
import { getDepartmentsAction } from "@/services/action/department.action";
import { getCountriesAction } from "@/services/action/master.action";
import { Department, Country } from "@/type";
import { toast } from "@/Utils/toast";
import { useSession } from "next-auth/react";
import { BASE_URL } from "@/services/api";

export default function ReportsPage() {
  const { data: session } = useSession();
  const token = (session as any)?.token;

  const [deptReport, setDeptReport] = useState<any[]>([]);
  const [trendReport, setTrendReport] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters for Export
  const [departments, setDepartments] = useState<Department[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [exportDept, setExportDept] = useState("");
  const [exportCountry, setExportCountry] = useState("");
  const [exportStatus, setExportStatus] = useState("Active");

  const [excelDownloading, setExcelDownloading] = useState(false);
  const [csvDownloading, setCsvDownloading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [deptRes, trendRes, overRes, deptListRes, countListRes] = await Promise.all([
        getReportsDepartmentsAction(),
        getReportsPayrollHistoryAction(),
        getReportsOverviewAction(),
        getDepartmentsAction(),
        getCountriesAction(),
      ]);

      if (deptRes?.data?.success) setDeptReport(deptRes.data.data?.departments || []);
      if (trendRes?.data?.success) setTrendReport(trendRes.data.data?.trends || []);
      if (overRes?.data?.success) setOverview(overRes.data.data);
      if (deptListRes?.data?.success) setDepartments(deptListRes.data.data?.departments || deptListRes.data.data || []);
      if (countListRes?.data?.success) setCountries(countListRes.data.data?.countries || countListRes.data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Download Handler (Excel / CSV)
  const handleExport = async (type: "excel" | "csv") => {
    if (!token) {
      toast.error("Authentication required for export.");
      return;
    }

    if (type === "excel") setExcelDownloading(true);
    else setCsvDownloading(true);

    try {
      const queryParams = new URLSearchParams();
      if (exportDept) queryParams.set("departmentId", exportDept);
      if (exportCountry) queryParams.set("countryId", exportCountry);
      if (exportStatus) queryParams.set("status", exportStatus);

      const endpoint = `${BASE_URL}/api/reports/export/${type}?${queryParams.toString()}`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to export file. Server returned " + res.status);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ACME_Payroll_Report_${new Date().toISOString().split("T")[0]}.${type === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${type.toUpperCase()} report successfully downloaded!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to export ${type}`);
    } finally {
      if (type === "excel") setExcelDownloading(false);
      else setCsvDownloading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reports & Data Export Center
            </h1>
            <p className="text-slate-500 text-sm">
              Export multi-sheet Excel registers, CSV audit ledgers & department analytics
            </p>
          </div>

          <Button
            size="sm"
            variant="flat"
            startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            onPress={fetchReports}
            className="bg-white border border-slate-200/80 text-slate-700 shadow-xs rounded-xl"
          >
            Refresh
          </Button>
        </div>

        {/* Export Configuration Card */}
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-xs">
          <CardHeader className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Export Payroll Datasets</h3>
                <p className="text-xs text-slate-400">
                  Generate customized Excel (.xlsx) workbooks and CSV files
                </p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-6 pt-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                size="sm"
                label="Department Scope"
                variant="bordered"
                selectedKeys={exportDept ? [String(exportDept)] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setExportDept(val || "");
                }}
              >
                {departments.map((d) => (
                  <SelectItem key={String(d._id)} textValue={d.name}>{d.name}</SelectItem>
                ))}
              </Select>

              <Select
                size="sm"
                label="Country Scope"
                variant="bordered"
                selectedKeys={exportCountry ? [String(exportCountry)] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setExportCountry(val || "");
                }}
              >
                {countries.map((c) => (
                  <SelectItem key={String(c._id)} textValue={`${c.name} (${c.code})`}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </Select>

              <Select
                size="sm"
                label="Status Scope"
                variant="bordered"
                selectedKeys={[exportStatus]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setExportStatus(val);
                }}
              >
                <SelectItem key="Active" textValue="Active Only">Active Only</SelectItem>
                <SelectItem key="Inactive" textValue="Inactive Only">Inactive Only</SelectItem>
                <SelectItem key="All" textValue="All Personnel">All Personnel</SelectItem>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Excel Download Button */}
              <Button
                color="primary"
                className="font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-500"
                startContent={<Download className="w-4 h-4" />}
                isLoading={excelDownloading}
                onPress={() => handleExport("excel")}
              >
                Export Excel Workbook (.xlsx)
              </Button>

              {/* CSV Download Button */}
              <Button
                variant="bordered"
                className="font-semibold shadow-xs border-slate-300 text-slate-700"
                startContent={<Download className="w-4 h-4" />}
                isLoading={csvDownloading}
                onPress={() => handleExport("csv")}
              >
                Export CSV Ledger (.csv)
              </Button>

              <span className="text-xs text-slate-400 ml-auto">
                Excel includes 3 formatted sheets: Employee Register, Dept Summary, Country Matrix.
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Department Compensation Breakdown Table */}
        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="px-6 pt-5 pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Department Compensation Breakdown</h3>
              <p className="text-xs text-slate-400">Headcounts and aggregated payroll by organizational unit</p>
            </div>
            <Chip size="sm" variant="flat" color="primary">
              Live Currency Rates
            </Chip>
          </CardHeader>
          <CardBody className="p-0">
            <Table aria-label="Department Report Table" removeWrapper>
              <TableHeader>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>ACTIVE HEADCOUNT</TableColumn>
                <TableColumn>TOTAL PAYROLL (INR)</TableColumn>
                <TableColumn>AVERAGE SALARY (INR)</TableColumn>
                <TableColumn>MIN / MAX SALARY</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={loading}
                loadingContent={<Spinner size="md" />}
                emptyContent="No department compensation data."
              >
                {deptReport.map((d: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-slate-800 text-sm">
                      {d.department}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">
                      {d.activeHeadcount} Staff
                    </TableCell>
                    <TableCell className="text-xs font-bold text-indigo-600">
                      ₹{Number(d.totalSalaryINR || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">
                      ₹{Number(d.avgSalaryINR || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      ₹{Number(d.minSalaryINR || 0).toLocaleString()} — ₹{Number(d.maxSalaryINR || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Historical Payroll Trend Table */}
        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="px-6 pt-5 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Historical Payroll & Revision Timeline</h3>
              <p className="text-xs text-slate-400">Monthly disbursement metrics across fiscal cycles</p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table aria-label="Payroll History Table" removeWrapper>
              <TableHeader>
                <TableColumn>PERIOD (MONTH / YEAR)</TableColumn>
                <TableColumn>REVISION ACTIVITY</TableColumn>
                <TableColumn>DISBURSED (INR)</TableColumn>
                <TableColumn>DISBURSED (USD)</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={loading}
                loadingContent={<Spinner size="md" />}
                emptyContent="No payroll history recorded."
              >
                {trendReport.map((t: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-slate-800 text-xs">
                      {t.month || t.yearMonth}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <Chip size="sm" variant="flat" color="warning" className="text-[11px]">
                        {t.count ?? t.revisionsCount ?? 0} Revisions
                      </Chip>
                    </TableCell>
                    <TableCell className="font-bold text-indigo-600 text-xs">
                      ₹{Math.round(Number(t.totalPayrollINR ?? t.totalDisbursed ?? 0)).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700 text-xs">
                      ${Math.round(Number(t.totalPayrollUSD ?? ((t.totalPayrollINR || t.totalDisbursed || 0) * 0.012))).toLocaleString("en-US")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
