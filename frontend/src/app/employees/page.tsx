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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
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
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  getEmployeesAction,
  getEmployeeByIdAction,
  createEmployeeAction,
  updateEmployeeAction,
  deleteEmployeeAction,
  sendEmployeeEmailAction,
} from "@/services/action/employee.action";
import { getDepartmentsAction } from "@/services/action/department.action";
import { getCountriesAction, getCurrenciesAction } from "@/services/action/master.action";
import { Employee, Department, Country, Currency, SalaryRevision } from "@/type";
import { toast } from "@/Utils/toast";
import { BASE_URL } from "@/services/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Master Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Modals disclosure
  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onOpenChange: onOpenCreateChange,
    onClose: onCloseCreate,
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: onOpenDetail,
    onOpenChange: onOpenDetailChange,
    onClose: onCloseDetail,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onOpenChange: onOpenDeleteChange,
    onClose: onCloseDelete,
  } = useDisclosure();

  // Active / Selected Employee
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [empDetailData, setEmpDetailData] = useState<{
    employee: Employee | null;
    salaryHistory: SalaryRevision[];
  }>({ employee: null, salaryHistory: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    departmentId: "",
    role: "Employee",
    level: "Mid",
    countryId: "",
    currencyId: "",
    salary: 50000,
    hireDate: new Date().toISOString().split("T")[0],
    employmentType: "Full-time",
    status: "Active",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load Master Data
  useEffect(() => {
    async function loadMasters() {
      try {
        const [deptRes, countRes, currRes] = await Promise.all([
          getDepartmentsAction(),
          getCountriesAction(),
          getCurrenciesAction(),
        ]);
        if (deptRes?.data?.success) setDepartments(deptRes.data.data?.departments || deptRes.data.data || []);
        if (countRes?.data?.success) setCountries(countRes.data.data?.countries || countRes.data.data || []);
        if (currRes?.data?.success) setCurrencies(currRes.data.data?.currencies || currRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMasters();
  }, []);

  // Fetch Employees List
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedRole) params.role = selectedRole;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedType) params.employmentType = selectedType;

      const res = await getEmployeesAction(params);
      if (res?.data?.success) {
        setEmployees(res.data.data.employees || []);
        setTotal(res.data.data.pagination?.total ?? res.data.data.total ?? 0);
        setTotalPages(res.data.data.pagination?.totalPages ?? res.data.data.totalPages ?? 1);
      } else {
        toast.error(res?.error || "Failed to fetch employees");
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching employees");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedDept, selectedStatus, selectedRole, selectedLevel, selectedType]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      employeeCode: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "Software Engineer",
      departmentId: departments[0]?._id || "",
      role: "Employee",
      level: "Mid",
      countryId: countries[0]?._id || "",
      currencyId: currencies[0]?._id || "",
      salary: 60000,
      hireDate: new Date().toISOString().split("T")[0],
      employmentType: "Full-time",
      status: "Active",
    });
    onOpenCreate();
  };

  // Open Edit Modal
  const handleOpenEdit = (emp: Employee) => {
    setIsEditMode(true);
    setSelectedEmp(emp);
    setFormData({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      jobTitle: emp.jobTitle || "Software Engineer",
      departmentId: typeof emp.departmentId === "object" ? emp.departmentId._id : emp.departmentId,
      role: emp.role,
      level: emp.level,
      countryId: typeof emp.countryId === "object" ? emp.countryId._id : emp.countryId,
      currencyId: typeof emp.currencyId === "object" ? emp.currencyId._id : emp.currencyId,
      salary: emp.salary,
      hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : "",
      employmentType: emp.employmentType,
      status: emp.status,
    });
    onOpenCreate();
  };

  // Save Employee (Create or Update)
  const handleSaveEmployee = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.jobTitle || !formData.departmentId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedEmp) {
        const res = await updateEmployeeAction(selectedEmp._id, formData);
        if (res?.data?.success) {
          toast.success("Employee updated successfully!");
          onCloseCreate();
          fetchEmployees();
        } else {
          toast.error(res?.error || res?.data?.message || "Failed to update employee");
        }
      } else {
        const res = await createEmployeeAction(formData);
        if (res?.data?.success) {
          toast.success("Employee created and onboarding email queued!");
          onCloseCreate();
          fetchEmployees();
        } else {
          toast.error(res?.error || res?.data?.message || "Failed to create employee");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save employee");
    } finally {
      setFormLoading(false);
    }
  };

  // View Details & Salary History
  const handleViewDetails = async (emp: Employee) => {
    setSelectedEmp(emp);
    setDetailLoading(true);
    onOpenDetail();
    try {
      const res = await getEmployeeByIdAction(emp._id, 1, 20);
      if (res?.data?.success) {
        setEmpDetailData({
          employee: res.data.data.employee,
          salaryHistory: res.data.data.salaryHistory?.records || [],
        });
      }
    } catch (err: any) {
      toast.error("Failed to load employee details");
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedEmp) return;
    setDeleteLoading(true);
    try {
      const res = await deleteEmployeeAction(selectedEmp._id, deletePermanent);
      if (res?.data?.success) {
        toast.success(
          deletePermanent ? "Employee permanently deleted." : "Employee deactivated successfully."
        );
        onCloseDelete();
        fetchEmployees();
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to delete employee");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting employee");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Send Email Action
  const handleSendEmail = async (emp: Employee, salaryId?: string) => {
    try {
      toast.info(`Sending email dispatch to ${emp.email}...`);
      const res = await sendEmployeeEmailAction(emp._id, {
        salaryId,
        subject: "Your Official ACME Compensation Statement",
      });
      if (res?.data?.success) {
        toast.success("Email with payslip successfully sent!");
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to dispatch email");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
            <p className="text-slate-500 text-sm">
              Manage personnel records, departments, and compensation contracts ({total.toLocaleString()} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onPress={fetchEmployees}
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
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Input
                size="sm"
                placeholder="Search by code, name, or email..."
                variant="bordered"
                value={search}
                onValueChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                startContent={<Search className="w-4 h-4 text-slate-400" />}
                isClearable
                onClear={() => setSearch("")}
              />
            </div>

            {/* Department Filter */}
            <Select
              size="sm"
              label="Department"
              variant="bordered"
              selectedKeys={selectedDept ? [selectedDept] : []}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
            >
              {departments.map((dept) => (
                <SelectItem key={dept._id}>{dept.name}</SelectItem>
              ))}
            </Select>

            {/* Level Filter */}
            <Select
              size="sm"
              label="Level"
              variant="bordered"
              selectedKeys={selectedLevel ? [selectedLevel] : []}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setPage(1);
              }}
            >
              {["Junior", "Mid", "Senior", "Lead", "Executive"].map((lvl) => (
                <SelectItem key={lvl}>{lvl}</SelectItem>
              ))}
            </Select>

            {/* Type Filter */}
            <Select
              size="sm"
              label="Type"
              variant="bordered"
              selectedKeys={selectedType ? [selectedType] : []}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
            >
              {["Full-time", "Part-time", "Contract", "Intern"].map((t) => (
                <SelectItem key={t}>{t}</SelectItem>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              size="sm"
              label="Status"
              variant="bordered"
              selectedKeys={selectedStatus ? [selectedStatus] : []}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <SelectItem key="Active">Active</SelectItem>
              <SelectItem key="Inactive">Inactive</SelectItem>
            </Select>
          </div>

          {(selectedDept || selectedLevel || selectedType || selectedStatus || search) && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Active filters:</span>
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="h-6 text-xs p-1"
                onPress={() => {
                  setSearch("");
                  setSelectedDept("");
                  setSelectedLevel("");
                  setSelectedType("");
                  setSelectedStatus("");
                  setPage(1);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table aria-label="Employee Table" removeWrapper className="min-w-full">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>DEPARTMENT & ROLE</TableColumn>
              <TableColumn>SENIORITY</TableColumn>
              <TableColumn>LOCATION & CURRENCY</TableColumn>
              <TableColumn>SALARY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={<Spinner size="md" color="primary" />}
              emptyContent={<div className="p-8 text-center text-slate-500">No employees found.</div>}
            >
              {employees.map((emp) => {
                const deptName =
                  typeof emp.departmentId === "object" ? emp.departmentId?.name : "General";
                const countryCode =
                  typeof emp.countryId === "object" ? emp.countryId?.code : "Global";
                const currCode =
                  typeof emp.currencyId === "object" ? emp.currencyId?.code : "INR";

                return (
                  <TableRow key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                          {emp.firstName?.[0]}
                          {emp.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{emp.employeeCode} • {emp.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{deptName}</p>
                        <p className="text-[11px] text-slate-400">{emp.role}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          emp.level === "Executive" || emp.level === "Lead"
                            ? "secondary"
                            : emp.level === "Senior"
                            ? "primary"
                            : "default"
                        }
                        className="text-[11px]"
                      >
                        {emp.level}
                      </Chip>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold">{countryCode}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-mono text-slate-500">{currCode}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-slate-800 text-sm">
                        {currCode} {Number(emp.salary).toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="dot"
                        color={emp.status === "Active" ? "success" : "danger"}
                        className="text-xs border-0"
                      >
                        {emp.status}
                      </Chip>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-600 hover:text-indigo-600"
                          title="View Details & Ledger"
                          onPress={() => handleViewDetails(emp)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-600 hover:text-emerald-600"
                          title="Edit Details"
                          onPress={() => handleOpenEdit(emp)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Employee Actions">
                            <DropdownItem
                              key="email"
                              startContent={<Mail className="w-4 h-4 text-indigo-500" />}
                              onPress={() => handleSendEmail(emp)}
                            >
                              Dispatch Welcome / Slip Email
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              color="danger"
                              className="text-danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => {
                                setSelectedEmp(emp);
                                setDeletePermanent(false);
                                onOpenDelete();
                              }}
                            >
                              Deactivate / Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500 gap-3">
            <span>
              Showing {employees.length} of {total.toLocaleString()} records (Page {page} of {totalPages})
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

      {/* Create / Edit Employee Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onOpenCreateChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Edit Employee Profile" : "Register New Employee"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Employee Code *"
                placeholder="e.g. EMP1001"
                variant="bordered"
                value={formData.employeeCode}
                onValueChange={(v) => setFormData({ ...formData, employeeCode: v })}
                isDisabled={isEditMode}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="name@company.com"
                variant="bordered"
                value={formData.email}
                onValueChange={(v) => setFormData({ ...formData, email: v })}
              />
              <Input
                label="First Name *"
                placeholder="John"
                variant="bordered"
                value={formData.firstName}
                onValueChange={(v) => setFormData({ ...formData, firstName: v })}
              />
              <Input
                label="Last Name *"
                placeholder="Doe"
                variant="bordered"
                value={formData.lastName}
                onValueChange={(v) => setFormData({ ...formData, lastName: v })}
              />
              <Input
                label="Job Title *"
                placeholder="e.g. Senior Software Engineer"
                variant="bordered"
                value={formData.jobTitle}
                onValueChange={(v) => setFormData({ ...formData, jobTitle: v })}
              />

              <Select
                label="Department *"
                variant="bordered"
                selectedKeys={formData.departmentId ? [formData.departmentId] : []}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <SelectItem key={d._id}>{d.name}</SelectItem>
                ))}
              </Select>

              <Select
                label="Role *"
                variant="bordered"
                selectedKeys={[formData.role]}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <SelectItem key="Employee">Employee</SelectItem>
                <SelectItem key="HR">HR Manager</SelectItem>
              </Select>

              <Select
                label="Seniority Level *"
                variant="bordered"
                selectedKeys={[formData.level]}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              >
                {["Junior", "Mid", "Senior", "Lead", "Executive"].map((lvl) => (
                  <SelectItem key={lvl}>{lvl}</SelectItem>
                ))}
              </Select>

              <Select
                label="Employment Type *"
                variant="bordered"
                selectedKeys={[formData.employmentType]}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
              >
                {["Full-time", "Part-time", "Contract", "Intern"].map((t) => (
                  <SelectItem key={t}>{t}</SelectItem>
                ))}
              </Select>

              <Select
                label="Country *"
                variant="bordered"
                selectedKeys={formData.countryId ? [formData.countryId] : []}
                onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
              >
                {countries.map((c) => (
                  <SelectItem key={c._id}>{c.name} ({c.code})</SelectItem>
                ))}
              </Select>

              <Select
                label="Currency *"
                variant="bordered"
                selectedKeys={formData.currencyId ? [formData.currencyId] : []}
                onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}
              >
                {currencies.map((c) => (
                  <SelectItem key={c._id}>{c.code} - {c.name}</SelectItem>
                ))}
              </Select>

              <Input
                label="Monthly Salary *"
                type="number"
                placeholder="60000"
                variant="bordered"
                value={String(formData.salary)}
                onValueChange={(v) => setFormData({ ...formData, salary: Number(v) })}
              />

              <Input
                label="Hire Date *"
                type="date"
                variant="bordered"
                value={formData.hireDate}
                onValueChange={(v) => setFormData({ ...formData, hireDate: v })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseCreate}>
              Cancel
            </Button>
            <Button color="primary" isLoading={formLoading} onPress={handleSaveEmployee}>
              {isEditMode ? "Save Changes" : "Create Employee"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Employee Details & Salary History Drawer Modal */}
      <Modal isOpen={isDetailOpen} onOpenChange={onOpenDetailChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Employee Compensation Profile</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {detailLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : selectedEmp ? (
              <div className="space-y-6">
                {/* Profile Overview */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Full Name</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedEmp.firstName} {selectedEmp.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Employee Code</span>
                    <p className="font-mono font-semibold text-slate-800 text-sm mt-0.5">
                      {selectedEmp.employeeCode}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Salary</span>
                    <p className="font-bold text-indigo-600 text-sm mt-0.5">
                      {Number(selectedEmp.salary).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Status</span>
                    <p className="mt-0.5">
                      <Chip size="sm" color={selectedEmp.status === "Active" ? "success" : "danger"} variant="flat">
                        {selectedEmp.status}
                      </Chip>
                    </p>
                  </div>
                </div>

                {/* Salary Revisions History Ledger */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Salary Revisions & Payslips ({empDetailData.salaryHistory.length})
                    </h4>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <Table aria-label="Salary History" removeWrapper>
                      <TableHeader>
                        <TableColumn>EFFECTIVE DATE</TableColumn>
                        <TableColumn>BASE SALARY</TableColumn>
                        <TableColumn>PAY SALARY</TableColumn>
                        <TableColumn>REMARK</TableColumn>
                        <TableColumn align="center">PAYSLIP</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="No salary history available.">
                        {empDetailData.salaryHistory.map((rev) => (
                          <TableRow key={rev._id}>
                            <TableCell className="font-mono text-xs">
                              {rev.effectiveDate ? new Date(rev.effectiveDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              {Number(rev.baseSalary).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-indigo-600">
                              {Number(rev.paySalary).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {rev.remark || "Regular adjustment"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={`${BASE_URL}/api/salaries/${rev._id}/pdf`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                  <Download className="w-3.5 h-3.5" /> PDF
                                </a>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="text-slate-500 hover:text-indigo-600"
                                  title="Dispatch Payslip Email"
                                  onPress={() => handleSendEmail(selectedEmp, rev._id)}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDetail}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete / Deactivate Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onOpenDeleteChange}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5" />
            <span>Confirm Employee Removal</span>
          </ModalHeader>
          <ModalBody className="space-y-3">
            <p className="text-sm text-slate-600">
              Are you sure you want to deactivate{" "}
              <span className="font-bold text-slate-800">
                {selectedEmp?.firstName} {selectedEmp?.lastName}
              </span>{" "}
              ({selectedEmp?.employeeCode})?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={deletePermanent}
                  onChange={(e) => setDeletePermanent(e.target.checked)}
                  className="rounded text-danger"
                />
                Permanently delete from database (Cannot be undone)
              </label>
              <p className="text-[11px] text-amber-700 mt-1 pl-5">
                If unchecked, employee status will simply be set to "Inactive" (soft delete).
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              Cancel
            </Button>
            <Button color="danger" isLoading={deleteLoading} onPress={handleDeleteConfirm}>
              {deletePermanent ? "Permanently Delete" : "Deactivate"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
