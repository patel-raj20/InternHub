"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Bot,
  ShieldCheck, 
  Settings, 
  LogOut,
  Building2,
  FileText,
  QrCode,
  CalendarCheck,
  ClipboardList,
  LayoutGrid,
  Activity,
  User,
  ChevronLeft,
  ChevronRight,
  LucideIcon
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setRole } from "@/store/slices/userSlice";
import { toggleCollapse } from "@/store/slices/uiSlice";
import { motion, AnimatePresence } from "framer-motion";

type UserRole = "INTERN" | "DEPT_ADMIN" | "SUPER_ADMIN" | "DEVELOPER";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const menuConfigs: (orgId?: string | null) => Record<UserRole, MenuItem[]> = (orgId) => ({
  INTERN: [
    { label: "Dashboard", href: "/intern/dashboard", icon: LayoutDashboard },
    { label: "My Tasks", href: "/intern/tasks", icon: ClipboardList },
    { label: "Attendance", href: "/intern/attendance", icon: QrCode },
    { label: "My Profile", href: "/profile", icon: User },
  ],
  DEPT_ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "All Interns", href: "/admin/reports" },
    { icon: Building2, label: "Dept Assignments", href: "/admin/department-tasks" },
    { icon: ClipboardList, label: "Direct Tasks", href: "/admin/tasks" },
    { icon: LayoutGrid, label: "Monitor Tasks", href: "/admin/monitoring" },
    { icon: CalendarCheck, label: "Attendance", href: "/admin/attendance" },
    { icon: Bot, label: "Chatbot", href: "/admin/chatbot" },
  ],
  DEVELOPER: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/developer/dashboard" },
    { icon: Building2, label: "All Organizations", href: "/super-admin/organizations" },
  ],
  SUPER_ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin/dashboard" },
    { 
      icon: Building2, 
      label: orgId ? "My Organization" : "Organizations", 
      href: orgId ? `/super-admin/organizations/${orgId}` : "/super-admin/organizations" 
    },
    { icon: Users, label: "All Interns", href: "/super-admin/reports" },
    { icon: ClipboardList, label: "Master Tasks", href: "/super-admin/tasks" },
    { icon: LayoutGrid, label: "Monitor Tasks", href: "/super-admin/monitoring" },
    { icon: Bot, label: "Chatbot", href: "/super-admin/chatbot" },
    { icon: UserPlus, label: "Add Intern", href: "/super-admin/create-intern" },
  ],
});

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { name, role, organization_id } = useSelector((state: RootState) => state.user);
  const isOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const isCollapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const [mounted, setMounted] = useState(false);

  const menuItems = useMemo(() => {
    return role ? menuConfigs(organization_id)[role as keyof ReturnType<typeof menuConfigs>] : [];
  }, [role, organization_id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] glass-card border-r shadow-2xl">
        <div className="flex h-full flex-col px-4 py-6" />
      </aside>
    );
  }

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 260,
        x: isOpen ? 0 : -260
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen glass-card border-r shadow-2xl flex flex-col !overflow-visible",
        "lg:translate-x-0"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => dispatch(toggleCollapse())}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-background text-primary shadow-lg transition-transform hover:scale-110 active:scale-95 hidden lg:flex"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex h-full flex-col px-4 py-6 overflow-hidden">
        {/* Branding */}
        <div className="mb-12 flex items-center justify-center lg:justify-start px-2 h-8">
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
              >
                <span className="text-white font-black text-xs">IH</span>
              </motion.div>
            ) : (
              <motion.span
                key="expanded-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent uppercase whitespace-nowrap"
              >
                InternHub
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar py-2">
          {menuItems.map((item: MenuItem) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-xl p-3 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 h-8 w-1.5 rounded-r-full bg-primary shadow-[4px_0_15px_rgba(0,122,255,0.6)]" 
                  />
                )}
                
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
                  isActive ? "text-primary neon-glow" : "text-muted-foreground",
                  !isCollapsed && "mr-3"
                )} />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isCollapsed && (
                  <div className="absolute left-full ml-4 hidden rounded-lg bg-foreground px-2 py-1 text-xs text-background group-hover:block whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Widget */}
        <div className="mt-auto border-t border-border/50 pt-6 space-y-4">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="user-widget"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
                  {getInitials(name ?? undefined)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black truncate">{name || "User Account"}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{role}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="user-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center"
              >
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border/50 shadow-inner">
                  <User size={18} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex w-full items-center rounded-xl p-3 text-sm font-bold text-red-500/80 transition-all hover:bg-red-500/10 hover:text-red-500",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 hidden rounded-lg bg-red-500 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
