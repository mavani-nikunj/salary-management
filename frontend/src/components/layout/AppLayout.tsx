"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
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
} from "@heroui/react";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Building2,
  FileSpreadsheet,
  LogOut,
  KeyRound,
  Menu,
  X,
  ChevronRight,
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

  const mainNavItems = [
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

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/employees")) return "Employees Management";
    if (pathname.startsWith("/salaries")) return "Salary Ledger";
    if (pathname.startsWith("/departments")) return "Departments";
    if (pathname.startsWith("/reports")) return "Reports & Exports";
    return "Dashboard";
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#F8F9FA] flex overflow-hidden font-sans antialiased text-slate-800">
      {/* Full Viewport App Frame - Edge to edge */}
      <div className="w-full h-full flex overflow-hidden">
        
        {/* Left Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white border-r border-slate-200/80 shrink-0 select-none">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-6 h-16 lg:h-20 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-300 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-1 h-2 bg-sky-400 rounded-xs"></span>
                  <span className="w-1 h-3 bg-blue-500 rounded-xs"></span>
                  <span className="w-1 h-2.5 bg-blue-600 rounded-xs"></span>
                </div>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">
                Salary Management
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Payroll & Analytics</p>
            </div>
          </div>

          {/* Navigation Links Area */}
          <div className="flex-1 px-4 py-5 overflow-y-auto space-y-6">
            {/* Primary Section */}
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Menu
              </p>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#1890FF] text-white shadow-md shadow-blue-500/25 font-semibold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Log Out Button at Bottom */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Dashboard Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8F9FA]/80">
          
          {/* Top Modern Header Bar */}
          <header className="h-16 lg:h-18 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="md:hidden text-slate-700 rounded-lg hover:bg-slate-100"
                onPress={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="md:hidden w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-300 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-md flex items-center justify-center">
                    <span className="w-1 h-2.5 bg-blue-600 rounded-xs"></span>
                  </div>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Profile Chip */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-2 cursor-pointer p-0.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center">
                      <Avatar
                        name={user?.name || "Tanisha Hertel"}
                        size="sm"
                        className="w-full h-full text-white font-bold text-xs bg-slate-900 border border-white"
                      />
                    </div>
                    <div className="hidden lg:block text-left text-xs leading-tight pr-1">
                      <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                        {user?.name || "Tanisha Hertel"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {user?.role === "HR" ? "HR Admin" : "User"}
                      </p>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="User Options" variant="flat">
                  <DropdownItem key="user-info" textValue="User Info" className="h-12 gap-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.email || "tanisha@dataspot.io"}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="change-password"
                    startContent={<KeyRound className="w-4 h-4 text-slate-500" />}
                    onPress={onOpenChangePw}
                  >
                    Change Password
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    className="text-rose-600"
                    startContent={<LogOut className="w-4 h-4" />}
                    onPress={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </header>

          {/* Mobile Drawer (Native Mobile Side Sheet) */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer Content */}
              <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-300 p-0.5 flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-md flex items-center justify-center">
                        <span className="w-1 h-3 bg-blue-600 rounded-xs"></span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-slate-900 leading-tight">Salary Management</h2>
                      <p className="text-[10px] text-slate-400">Payroll & Analytics</p>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="rounded-full text-slate-500 hover:text-slate-800"
                    onPress={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* User Info Card in Drawer */}
                <div className="p-4 mx-4 my-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <Avatar
                    name={user?.name || "Tanisha Hertel"}
                    size="sm"
                    className="text-white font-bold text-xs bg-slate-900"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user?.name || "Tanisha Hertel"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {user?.email || "tanisha@dataspot.io"}
                    </p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-4 py-2 overflow-y-auto space-y-5">
                  <div>
                    <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Main Menu
                    </p>
                    <nav className="space-y-1">
                      {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-[#1890FF] text-white shadow-xs font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Log Out at Bottom of Drawer */}
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50/60 hover:bg-rose-100/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-20 md:pb-6">
            <div className="w-full mx-auto">{children}</div>
          </main>

          {/* Mobile Bottom Navigation Bar (Native App Style) */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-[#1890FF] font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-1 rounded-lg ${isActive ? "bg-blue-50 text-[#1890FF]" : ""}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="mt-0.5 truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isChangePwOpen} onOpenChange={onOpenChangePwChange} placement="center">
        <ModalContent className="rounded-2xl">
          <ModalHeader className="flex flex-col gap-1 text-slate-800">
            Change Account Password
          </ModalHeader>
          <ModalBody className="space-y-3">
            <Input
              type="password"
              label="Current Password"
              placeholder="Enter current password"
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
            <Button variant="light" className="rounded-xl" onPress={onCloseChangePw}>
              Cancel
            </Button>
            <Button
              className="bg-[#1890FF] text-white rounded-xl shadow-md shadow-blue-500/25"
              isLoading={pwLoading}
              onPress={handleChangePassword}
            >
              Update Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
