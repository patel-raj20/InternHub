"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  LucideIcon
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setRole } from "@/store/slices/userSlice";

type UserRole = "INTERN" | "DEPT_ADMIN" | "SUPER_ADMIN";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const menuConfigs: Record<UserRole, MenuItem[]> = {
  INTERN: [
    { label: "My Profile", href: "/profile", icon: LayoutDashboard },
  ],
  DEPT_ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "All Interns", href: "/admin/reports" },
    { icon: Bot, label: "Chatbot", href: "/admin/chatbot" },
  ],
  SUPER_ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin/dashboard" },
    { icon: Building2, label: "Organizations", href: "/super-admin/organizations" },
    { icon: Users, label: "All Interns", href: "/super-admin/reports" },
    { icon: Bot, label: "Chatbot", href: "/super-admin/chatbot" },
    { icon: UserPlus, label: "Add Intern", href: "/super-admin/create-intern" },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { role } = useSelector((state: RootState) => state.user);
  const isOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] glass-card border-r transition-transform lg:translate-x-0 shadow-2xl">
        <div className="flex h-full flex-col px-4 py-6" />
      </aside>
    );
  }

  const menuItems = role ? menuConfigs[role as keyof typeof menuConfigs] : [];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-[260px] glass-card border-r transition-transform lg:translate-x-0 shadow-2xl",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-12 flex items-center px-2">
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent uppercase">
            InternHub
          </span>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto momentum-scroll">
          {/* Mobile role toggle removed for RBAC security */}
          
          {menuItems.map((item: MenuItem) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 h-8 w-1.5 rounded-r-full bg-primary shadow-[4px_0_15px_rgba(0,122,255,0.6)]" />
                )}
                
                <Icon className={cn(
                  "mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-primary neon-glow" : "text-muted-foreground"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border/50 pt-6 space-y-1">
          <div className="px-3 py-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
            System Control
          </div>
          <button 
            onClick={() => {
              signOut({ callbackUrl: "/login" });
            }}
            className="flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-bold text-red-500/80 transition-all hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
