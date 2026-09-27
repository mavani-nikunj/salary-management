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
        if (deptRes?.data?.success) {
          const depts = deptRes.data.data?.departments || deptRes.data.data || [];
          setDepartments(depts);
        }
        if (countRes?.data?.success) {
          const loadedCountries = countRes.data.data?.countries || countRes.data.data || [];
          setCountries(loadedCountries);
        }
        if (currRes?.data?.success) {
          const loadedCurrencies = currRes.data.data?.currencies || currRes.data.data || [];
          setCurrencies(loadedCurrencies);
        }
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
    setSelectedEmp(null);
    const defaultCountry = countries[0]?._id ? String(countries[0]._id) : "";
    const defaultCurrency = currencies[0]?._id ? String(currencies[0]._id) : "";
    const defaultDept = departments[0]?._id ? String(departments[0]._id) : "";

    setFormData({
      employeeCode: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "Software Engineer",
      departmentId: defaultDept,
      role: "Employee",
      level: "Mid",
      countryId: defaultCountry,
      currencyId: defaultCurrency,
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

    const deptIdStr = emp.departmentId && typeof emp.departmentId === "object"
      ? String(emp.departmentId._id)
      : (emp.departmentId ? String(emp.departmentId) : "");

    const countryIdStr = emp.countryId && typeof emp.countryId === "object"
      ? String(emp.countryId._id)
      : (emp.countryId ? String(emp.countryId) : "");

    const currencyIdStr = emp.currencyId && typeof emp.currencyId === "object"
      ? String(emp.currencyId._id)
      : (emp.currencyId ? String(emp.currencyId) : "");

    // Ensure the employee's country is present in the select options
    if (emp.countryId && typeof emp.countryId === "object" && emp.countryId._id) {
      const exists = countries.some((c) => String(c._id) === String((emp.countryId as any)._id));
      if (!exists) {
        setCountries((prev) => [...prev, emp.countryId as Country]);
      }
    }

    // Ensure the employee's currency is present in the select options
    if (emp.currencyId && typeof emp.currencyId === "object" && emp.currencyId._id) {
      const exists = currencies.some((c) => String(c._id) === String((emp.currencyId as any)._id));
      if (!exists) {
        setCurrencies((prev) => [...prev, emp.currencyId as Currency]);
      }
    }

    setFormData({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      jobTitle: emp.jobTitle || "Software Engineer",
      departmentId: deptIdStr,
      role: emp.role || "Employee",
      level: emp.level || "Mid",
      countryId: countryIdStr,
      currencyId: currencyIdStr,
      salary: emp.salary ?? 60000,
      hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : "",
      employmentType: emp.employmentType || "Full-time",
      status: emp.status || "Active",
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
              className="bg-white border border-slate-200/80 text-slate-700 shadow-xs rounded-xl"
            >
              Refresh
            </Button>
            <Button
              size="sm"
              className="font-semibold shadow-md shadow-blue-500/20 bg-[#1890FF] hover:bg-blue-600 text-white rounded-xl"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleOpenCreate}
            >
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 items-center">
            {/* Search Input */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2">
              <Input
                size="sm"
                placeholder="Search by code, name, or email..."
                variant="bordered"
                value={search}
                onValueChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                startContent={<Search className="w-4 h-4 text-slate-400 shrink-0" />}
                isClearable
                onClear={() => setSearch("")}
                classNames={{
                  inputWrapper: "h-10 border-slate-200 hover:border-slate-300 focus-within:!border-blue-500 rounded-xl",
                }}
              />
            </div>

            {/* Department Filter */}
            <div className="col-span-1">
              <Select
                size="sm"
                aria-label="Department"
                placeholder="Department"
                variant="bordered"
                selectedKeys={selectedDept ? [selectedDept] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setSelectedDept(val || "");
                  setPage(1);
                }}
                classNames={{
                  trigger: "h-10 border-slate-200 hover:border-slate-300 rounded-xl",
                }}
              >
                {departments.map((dept) => (
                  <SelectItem key={dept._id} textValue={dept.name}>{dept.name}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Level Filter */}
            <div className="col-span-1">
              <Select
                size="sm"
                aria-label="Level"
                placeholder="Level"
                variant="bordered"
                selectedKeys={selectedLevel ? [selectedLevel] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setSelectedLevel(val || "");
                  setPage(1);
                }}
                classNames={{
                  trigger: "h-10 border-slate-200 hover:border-slate-300 rounded-xl",
                }}
              >
                {["Junior", "Mid", "Senior", "Lead", "Executive"].map((lvl) => (
                  <SelectItem key={lvl} textValue={lvl}>{lvl}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Type Filter */}
            <div className="col-span-1">
              <Select
                size="sm"
                aria-label="Type"
                placeholder="Type"
                variant="bordered"
                selectedKeys={selectedType ? [selectedType] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setSelectedType(val || "");
                  setPage(1);
                }}
                classNames={{
                  trigger: "h-10 border-slate-200 hover:border-slate-300 rounded-xl",
                }}
              >
                {["Full-time", "Part-time", "Contract", "Intern"].map((t) => (
                  <SelectItem key={t} textValue={t}>{t}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Status Filter */}
            <div className="col-span-1">
              <Select
                size="sm"
                aria-label="Status"
                placeholder="Status"
                variant="bordered"
                selectedKeys={selectedStatus ? [selectedStatus] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  setSelectedStatus(val || "");
                  setPage(1);
                }}
                classNames={{
                  trigger: "h-10 border-slate-200 hover:border-slate-300 rounded-xl",
                }}
              >
                <SelectItem key="Active" textValue="Active">Active</SelectItem>
                <SelectItem key="Inactive" textValue="Inactive">Inactive</SelectItem>
              </Select>
            </div>
          </div>

          {(selectedDept || selectedLevel || selectedType || selectedStatus || search) && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Active filters:</span>
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="h-6 text-xs px-2 rounded-lg"
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

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200/80 flex items-center justify-center">
              <Spinner size="md" color="primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200/80 text-center text-slate-500 text-sm">
              No employees found.
            </div>
          ) : (
            employees.map((emp) => {
              const deptName =
                typeof emp.departmentId === "object" ? emp.departmentId?.name : "General";
              const countryCode =
                typeof emp.countryId === "object" ? emp.countryId?.code : "Global";
              const currCode =
                typeof emp.currencyId === "object" ? emp.currencyId?.code : "INR";

              return (
                <div key={emp._id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {emp.firstName?.[0]}
                        {emp.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {emp.employeeCode} • {emp.email}
                        </p>
                      </div>
                    </div>
                    <Chip
                      size="sm"
                      variant="dot"
                      color={emp.status === "Active" ? "success" : "danger"}
                      className="text-[11px] shrink-0"
                    >
                      {emp.status}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Department & Role</p>
                      <p className="font-medium text-slate-800 truncate">{deptName}</p>
                      <p className="text-[11px] text-slate-500">{emp.role}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Salary & Seniority</p>
                      <p className="font-bold text-slate-900">
                        {currCode} {Number(emp.salary).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500">{emp.level} • {countryCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Eye className="w-3.5 h-3.5" />}
                      onPress={() => handleViewDetails(emp)}
                      className="text-xs h-8 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<Edit className="w-3.5 h-3.5" />}
                      onPress={() => handleOpenEdit(emp)}
                      className="text-xs h-8 rounded-lg font-medium"
                    >
                      Edit
                    </Button>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" className="text-slate-500 h-8 w-8 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Employee Actions">
                        <DropdownItem
                          key="email"
                          startContent={<Mail className="w-4 h-4 text-indigo-500" />}
                          onPress={() => handleSendEmail(emp)}
                        >
                          Send Welcome / Slip Email
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
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
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
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
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
                            className="text-slate-600 hover:text-indigo-600 rounded-lg"
                            title="View Details & Ledger"
                            onPress={() => handleViewDetails(emp)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-slate-600 hover:text-emerald-600 rounded-lg"
                            title="Edit Details"
                            onPress={() => handleOpenEdit(emp)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light" className="text-slate-500 rounded-lg">
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
          </div>
        </div>

        {/* Pagination Card (Shared for both Mobile and Desktop) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
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
            className="overflow-x-auto max-w-full"
          />
        </div>
      </div>

      {/* Create / Edit Employee Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onOpenCreateChange} size="2xl" scrollBehavior="inside">
        <ModalContent className="rounded-2xl">
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
                selectedKeys={formData.departmentId ? [String(formData.departmentId)] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setFormData((prev) => ({ ...prev, departmentId: val }));
                }}
              >
                {departments.map((d) => (
                  <SelectItem key={String(d._id)} textValue={d.name}>{d.name}</SelectItem>
                ))}
              </Select>

              <Select
                label="Role *"
                variant="bordered"
                selectedKeys={[formData.role]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as any;
                  if (val) setFormData((prev) => ({ ...prev, role: val }));
                }}
              >
                <SelectItem key="Employee" textValue="Employee">Employee</SelectItem>
                <SelectItem key="HR" textValue="HR Manager">HR Manager</SelectItem>
              </Select>

              <Select
                label="Seniority Level *"
                variant="bordered"
                selectedKeys={[formData.level]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as any;
                  if (val) setFormData((prev) => ({ ...prev, level: val }));
                }}
              >
                {["Junior", "Mid", "Senior", "Lead", "Executive"].map((lvl) => (
                  <SelectItem key={lvl} textValue={lvl}>{lvl}</SelectItem>
                ))}
              </Select>

              <Select
                label="Employment Type *"
                variant="bordered"
                selectedKeys={[formData.employmentType]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as any;
                  if (val) setFormData((prev) => ({ ...prev, employmentType: val }));
                }}
              >
                {["Full-time", "Part-time", "Contract", "Intern"].map((t) => (
                  <SelectItem key={t} textValue={t}>{t}</SelectItem>
                ))}
              </Select>

              <Select
                label="Country *"
                variant="bordered"
                selectedKeys={formData.countryId ? [String(formData.countryId)] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setFormData((prev) => ({ ...prev, countryId: val }));
                }}
              >
                {countries.map((c) => (
                  <SelectItem key={String(c._id)} textValue={`${c.name} (${c.code})`}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Currency *"
                variant="bordered"
                selectedKeys={formData.currencyId ? [String(formData.currencyId)] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string;
                  if (val) setFormData((prev) => ({ ...prev, currencyId: val }));
                }}
              >
                {currencies.map((c) => (
                  <SelectItem key={String(c._id)} textValue={`${c.code} - ${c.name}`}>
                    {c.code} - {c.name}
                  </SelectItem>
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
