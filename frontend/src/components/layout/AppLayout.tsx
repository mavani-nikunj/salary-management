"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Chip,
} from "@heroui/react";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Building2,
  FileSpreadsheet,
  LogOut,
  KeyRound,
  ShieldCheck,
  Menu,
  X,
  User,
} from "lucide-react";
import { CallChangePassword } from "@/services/action/auth.action";
import { toast } from "@/Utils/toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user: any = session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Change Password Modal
  const {
    isOpen: isChangePwOpen,
    onOpen: onOpenChangePw,
    onOpenChange: onOpenChangePwChange,
    onClose: onCloseChangePw,
  } = useDisclosure();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Salary Ledger", href: "/salaries", icon: Banknote },
    { label: "Departments", href: "/departments", icon: Building2 },
    { label: "Reports & Exports", href: "/reports", icon: FileSpreadsheet },
  ];

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await CallChangePassword({ oldPassword, newPassword });
      if (res?.data?.success) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onCloseChangePw();
      } else {
        toast.error(res?.error || res?.data?.message || "Failed to change password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white leading-tight">
              ACME Payroll
            </h1>
            <p className="text-xs text-slate-400">Enterprise Edition</p>
          </div>
        </div>

        {/* Tenant badge */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tenant</span>
            <Chip size="sm" color="primary" variant="flat" className="text-[11px] font-semibold">
              {user?.name || "Nick Dev"}
            </Chip>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <Avatar
              name={user?.name || user?.firstName || "U"}
              size="sm"
              className="bg-indigo-700 text-white font-semibold"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.role || "Administrator"}</p>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-danger"
              onPress={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              className="md:hidden text-slate-700"
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {navItems.find((n) => pathname.startsWith(n.href))?.label || "Salary Management"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Currency Sync (12:00 AM UTC)</span>
            </div>

            {/* Profile Dropdown */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <Avatar
                    name={user?.name || user?.firstName || "U"}
                    size="sm"
                    className="bg-indigo-600 text-white font-bold"
                  />
                  <div className="hidden lg:block text-left text-xs mr-1">
                    <p className="font-semibold text-slate-800 leading-tight">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="profile" textValue="Signed in" className="h-14 gap-2">
                  <p className="font-semibold text-xs text-slate-500">Signed in as</p>
                  <p className="font-bold text-sm text-slate-800">{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="change-password"
                  startContent={<KeyRound className="w-4 h-4 text-slate-600" />}
                  onPress={onOpenChangePw}
                >
                  Change Password
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  className="text-danger"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isChangePwOpen} onOpenChange={onOpenChangePwChange} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Change Account Password</ModalHeader>
          <ModalBody className="space-y-3">
            <Input
              type="password"
              label="Current Password"
              placeholder="Enter existing password"
              variant="bordered"
              value={oldPassword}
              onValueChange={setOldPassword}
            />
            <Input
              type="password"
              label="New Password"
              placeholder="Minimum 6 characters"
              variant="bordered"
              value={newPassword}
              onValueChange={setNewPassword}
            />
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              variant="bordered"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseChangePw}>
              Cancel
            </Button>
            <Button color="primary" isLoading={pwLoading} onPress={handleChangePassword}>
              Update Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
