"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  Mail,
  Trash2,
  Edit,
  Banknote,
  FileSpreadsheet,
} from "lucide-react";
import {
  getSalariesAction,
  createSalaryAction,
  updateSalaryAction,
  deleteSalaryAction,
  sendSalaryEmailAction,
} from "@/services/action/salary.action";
import { getEmployeesAction } from "@/services/action/employee.action";
import { getCurrenciesAction } from "@/services/action/master.action";
import { SalaryRevision, Employee, Currency } from "@/type";
import { toast } from "@/Utils/toast";
import { BASE_URL } from "@/services/api";

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<SalaryRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Master lists for revision modal
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [currenciesList, setCurrenciesList] = useState<Currency[]>([]);

  // Disclosures
  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onOpenChange: onOpenCreateChange,
    onClose: onCloseCreate,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onOpenChange: onOpenDeleteChange,
    onClose: onCloseDelete,
  } = useDisclosure();

  const [selectedRevision, setSelectedRevision] = useState<SalaryRevision | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: "",
    baseSalary: 50000,
    paySalary: 55000,
    currencyId: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    remark: "Annual performance appraisal increment",
    sendEmail: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Salaries
  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (search.trim()) params.search = search.trim();

      const res = await getSalariesAction(params);
      if (res?.data?.success) {
        setSalaries(res.data.data.salaries || []);
        setTotal(res.data.data.pagination?.total ?? res.data.data.total ?? 0);
        setTotalPages(res.data.data.pagination?.totalPages ?? res.data.data.totalPages ?? 1);
      } else {
        toast.error(res?.error || "Failed to load salaries");
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching salaries");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  // Load dropdown employees & currencies
  useEffect(() => {
    async function loadSelectData() {
      try {
        const [empRes, currRes] = await Promise.all([
          getEmployeesAction({ limit: 100 }),
          getCurrenciesAction(),
        ]);
        if (empRes?.data?.success) setEmployeesList(empRes.data.data.employees || []);
        if (currRes?.data?.success) setCurrenciesList(currRes.data.data?.currencies || currRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadSelectData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      employeeId: employeesList[0]?._id || "",
      baseSalary: 50000,
      paySalary: 55000,
      currencyId: currenciesList[0]?._id || "",
      effectiveDate: new Date().toISOString().split("T")[0],
      remark: "Annual appraisal adjustment",
      sendEmail: false,
    });
    onOpenCreate();
  };

  const handleOpenEdit = (rev: SalaryRevision) => {
    setIsEditMode(true);
    setSelectedRevision(rev);
    const empId = typeof rev.employeeId === "object" ? rev.employeeId._id : rev.employeeId;
    const currId = typeof rev.currencyId === "object" ? rev.currencyId._id : rev.currencyId;

    setFormData({
      employeeId: empId,
      baseSalary: rev.baseSalary,
      paySalary: rev.paySalary,
      currencyId: currId,
      effectiveDate: rev.effectiveDate ? rev.effectiveDate.split("T")[0] : "",
      remark: rev.remark || "",
      sendEmail: false,
    });
    onOpenCreate();
  };

  const handleSaveRevision = async () => {
    if (!formData.employeeId || !formData.effectiveDate || !formData.paySalary) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedRevision) {
        const res = await updateSalaryAction(selectedRevision._id, formData);
        if (res?.data?.success) {
          toast.success("Salary revision updated and profile synchronized!");
          onCloseCreate();
          fetchSalaries();
        } else {
          toast.error(res?.error || res?.data?.message || "Failed to update revision");
        }
      } else {
        const res = await createSalaryAction(formData);
        if (res?.data?.success) {
          toast.success("Salary revision logged successfully!");
          onCloseCreate();
          fetchSalaries();
        } else {
          toast.error(res?.error || res?.data?.message || "Failed to create revision");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save revision");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRevision) return;
    setDeleteLoading(true);
    try {
      const res = await deleteSalaryAction(selectedRevision._id);
      if (res?.data?.success) {
        toast.success("Salary revision removed and profile re-synchronized!");
        onCloseDelete();
        fetchSalaries();
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to delete revision");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting revision");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSendEmail = async (revId: string) => {
    try {
      toast.info("Sending salary slip email...");
      const res = await sendSalaryEmailAction(revId);
      if (res?.data?.success) {
        toast.success("Salary slip emailed to employee successfully!");
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to send email");
      }
    } catch (err: any) {
      toast.error(err.message || "Error sending email");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salary Revision Ledger</h1>
            <p className="text-slate-500 text-sm">
              Comprehensive audit trail of employee pay adjustments & PDF slip generator ({total.toLocaleString()} records)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onPress={fetchSalaries}
              className="bg-white border border-slate-200 text-slate-700 shadow-xs"
            >
              Refresh
            </Button>
            <Button
              size="sm"
              color="primary"
              className="font-semibold shadow-xs"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleOpenCreate}
            >
              Log New Revision
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <Input
            size="sm"
            placeholder="Search revision remark or employee name..."
            variant="bordered"
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            startContent={<Search className="w-4 h-4 text-slate-400" />}
            isClearable
            onClear={() => setSearch("")}
            className="max-w-md"
          />
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table aria-label="Salary Ledger" removeWrapper className="min-w-full">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>EFFECTIVE DATE</TableColumn>
              <TableColumn>BASE SALARY</TableColumn>
              <TableColumn>NET DISBURSED</TableColumn>
              <TableColumn>REMARK / JUSTIFICATION</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={<Spinner size="md" color="primary" />}
              emptyContent={<div className="p-8 text-center text-slate-500">No revisions recorded.</div>}
            >
              {salaries.map((rev) => {
                const emp = typeof rev.employeeId === "object" ? rev.employeeId : null;
                const curr = typeof rev.currencyId === "object" ? rev.currencyId?.code : "INR";

                return (
                  <TableRow key={rev._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {emp ? `${emp.firstName} ${emp.lastName}` : "Employee Record"}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {emp?.employeeCode} • {emp?.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-600">
                      {rev.effectiveDate ? new Date(rev.effectiveDate).toLocaleDateString() : "N/A"}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-600">
                      {curr} {Number(rev.baseSalary).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-indigo-600 text-sm">
                        {curr} {Number(rev.paySalary).toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {rev.remark || "Regular salary increment"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {/* Download Official PDF */}
                        <a
                          href={`${BASE_URL}/api/salaries/${rev._id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          title="Download Formatted PDF Payslip"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>

                        {/* Dispatch Email */}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-600 hover:text-indigo-600"
                          title="Email Salary Slip"
                          onPress={() => handleSendEmail(rev._id)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-600 hover:text-emerald-600"
                          title="Edit Revision"
                          onPress={() => handleOpenEdit(rev)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-600 hover:text-rose-600"
                          title="Delete Revision"
                          onPress={() => {
                            setSelectedRevision(rev);
                            onOpenDelete();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500 gap-3">
            <span>
              Showing {salaries.length} of {total.toLocaleString()} records (Page {page} of {totalPages})
            </span>
            <Pagination
              page={page}
              total={totalPages}
              onChange={(newPage) => setPage(newPage)}
              showControls
              color="primary"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Log / Edit Revision Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onOpenCreateChange} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-indigo-600" />
            <span>{isEditMode ? "Modify Revision Record" : "Record New Salary Adjustment"}</span>
          </ModalHeader>
          <ModalBody className="gap-4">
            <Select
              label="Select Employee *"
              variant="bordered"
              selectedKeys={formData.employeeId ? [formData.employeeId] : []}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              isDisabled={isEditMode}
            >
              {employeesList.map((emp) => (
                <SelectItem key={emp._id} textValue={`${emp.firstName} ${emp.lastName} (${emp.employeeCode})`}>
                  {emp.firstName} {emp.lastName} — {emp.employeeCode}
                </SelectItem>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Base Salary *"
                type="number"
                variant="bordered"
                value={String(formData.baseSalary)}
                onValueChange={(v) => setFormData({ ...formData, baseSalary: Number(v) })}
              />
              <Input
                label="Pay Salary (Net) *"
                type="number"
                variant="bordered"
                value={String(formData.paySalary)}
                onValueChange={(v) => setFormData({ ...formData, paySalary: Number(v) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Currency *"
                variant="bordered"
                selectedKeys={formData.currencyId ? [formData.currencyId] : []}
                onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}
              >
                {currenciesList.map((c) => (
                  <SelectItem key={c._id}>{c.code} - {c.name}</SelectItem>
                ))}
              </Select>

              <Input
                label="Effective Date *"
                type="date"
                variant="bordered"
                value={formData.effectiveDate}
                onValueChange={(v) => setFormData({ ...formData, effectiveDate: v })}
              />
            </div>

            <Input
              label="Remark / Justification"
              placeholder="e.g. Mid-year merit increase or promotion"
              variant="bordered"
              value={formData.remark}
              onValueChange={(v) => setFormData({ ...formData, remark: v })}
            />

            {!isEditMode && (
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                Automatically email official PDF payslip to employee upon saving
              </label>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseCreate}>
              Cancel
            </Button>
            <Button color="primary" isLoading={formLoading} onPress={handleSaveRevision}>
              {isEditMode ? "Save Changes" : "Log Revision"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Revision Confirmation */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onOpenDeleteChange}>
        <ModalContent>
          <ModalHeader className="text-danger">Delete Revision Record</ModalHeader>
          <ModalBody>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this salary revision? Deleting this record will
              automatically synchronize the employee's profile to their latest remaining revision.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              Cancel
            </Button>
            <Button color="danger" isLoading={deleteLoading} onPress={handleDeleteConfirm}>
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
