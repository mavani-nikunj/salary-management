"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import {
  Building2,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/services/action/department.action";
import { Department } from "@/type";
import { toast } from "@/Utils/toast";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onOpenChange: onOpenModalChange,
    onClose: onCloseModal,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onOpenChange: onOpenDeleteChange,
    onClose: onCloseDelete,
  } = useDisclosure();

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDepartmentsAction(search.trim());
      if (res?.data?.success) {
        setDepartments(res.data.data?.departments || res.data.data || []);
      } else {
        toast.error(res?.error || "Failed to load departments");
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching departments");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedDept(null);
    setName("");
    setStatus("Active");
    onOpenModal();
  };

  const handleOpenEdit = (dept: Department) => {
    setIsEditMode(true);
    setSelectedDept(dept);
    setName(dept.name);
    setStatus(dept.status);
    onOpenModal();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && selectedDept) {
        const res = await updateDepartmentAction(selectedDept._id, { name: name.trim(), status });
        if (res?.data?.success) {
          toast.success("Department updated successfully!");
          onCloseModal();
          fetchDepartments();
        } else {
          toast.error(res?.error || res?.data?.message || "Failed to update department");
        }
      } else {
        const res = await createDepartmentAction({ name: name.trim(), status });
        if (res?.data?.success) {
          toast.success("Department created successfully!");
          onCloseModal();
          fetchDepartments();
        } else {
          toast.error(res?.error || res?.data?.message || "Failed to create department");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    setDeleteLoading(true);
    try {
      const res = await deleteDepartmentAction(selectedDept._id);
      if (res?.data?.success) {
        toast.success("Department deleted successfully!");
        onCloseDelete();
        fetchDepartments();
      } else {
        toast.error(res?.error || res?.data?.message || "Cannot delete department");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting department");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Departments</h1>
            <p className="text-slate-500 text-sm">
              Workforce segmentation, headcounts, and organizational budgeting
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onPress={fetchDepartments}
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
              Add Department
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <Input
            size="sm"
            placeholder="Search departments..."
            variant="bordered"
            value={search}
            onValueChange={setSearch}
            startContent={<Search className="w-4 h-4 text-slate-400 shrink-0" />}
            isClearable
            onClear={() => setSearch("")}
            className="w-full sm:max-w-md"
            classNames={{
              inputWrapper: "h-10 border-slate-200 hover:border-slate-300 focus-within:!border-blue-500 rounded-xl",
            }}
          />
        </div>

        {/* Departments Grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No departments found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {departments.map((dept) => (
              <Card
                key={dept._id}
                className="border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow rounded-xl"
              >
                <CardHeader className="flex justify-between items-start p-5 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{dept.name}</h3>
                      <p className="text-xs text-slate-400">Department</p>
                    </div>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={dept.status === "Active" ? "success" : "default"}
                    className="text-xs"
                  >
                    {dept.status}
                  </Chip>
                </CardHeader>

                <CardBody className="p-5 pt-3 space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" /> Active Staff
                      </span>
                      <p className="font-bold text-slate-800 text-base mt-1">
                        {dept.activeEmployees ?? dept.totalEmployees ?? dept.employeeCount ?? 0}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> Avg Salary
                      </span>
                      <p className="font-bold text-indigo-600 text-sm mt-1">
                        ₹{Number(dept.avgSalaryINR || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="light"
                      className="text-slate-600 hover:text-indigo-600 text-xs font-semibold"
                      startContent={<Edit className="w-3.5 h-3.5" />}
                      onPress={() => handleOpenEdit(dept)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      className="text-slate-600 hover:text-rose-600 text-xs font-semibold"
                      startContent={<Trash2 className="w-3.5 h-3.5" />}
                      onPress={() => {
                        setSelectedDept(dept);
                        onOpenDelete();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Department Modal */}
      <Modal isOpen={isModalOpen} onOpenChange={onOpenModalChange}>
        <ModalContent>
          <ModalHeader>{isEditMode ? "Edit Department" : "Create New Department"}</ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Department Name *"
              placeholder="e.g. Artificial Intelligence"
              variant="bordered"
              value={name}
              onValueChange={setName}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="deptStatus"
                    value="Active"
                    checked={status === "Active"}
                    onChange={() => setStatus("Active")}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="deptStatus"
                    value="Inactive"
                    checked={status === "Inactive"}
                    onChange={() => setStatus("Inactive")}
                  />
                  Inactive
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseModal}>
              Cancel
            </Button>
            <Button color="primary" isLoading={submitting} onPress={handleSave}>
              {isEditMode ? "Save Changes" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Department Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onOpenDeleteChange}>
        <ModalContent>
          <ModalHeader className="text-danger flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Delete Department</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">{selectedDept?.name}</span>?
            </p>
            {Number(selectedDept?.activeEmployees ?? selectedDept?.totalEmployees ?? selectedDept?.employeeCount ?? 0) > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mt-2">
                ⚠️ This department currently has{" "}
                <span className="font-bold">
                  {selectedDept?.activeEmployees ?? selectedDept?.totalEmployees ?? selectedDept?.employeeCount}
                </span>{" "}
                active employees assigned. You must reassign or remove all employees before deleting this department.
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={deleteLoading}
              onPress={handleDelete}
              isDisabled={
                Number(selectedDept?.activeEmployees ?? selectedDept?.totalEmployees ?? selectedDept?.employeeCount ?? 0) > 0
              }
            >
              Delete Department
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
