"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { PageTransition } from "./page-transition";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setRole, setUser } from "@/store/slices/userSlice";
import { cn } from "@/lib/utils";

export function ContentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isLoginPage = pathname.startsWith("/login");
  const { sidebarOpen, sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    
    if (status === "authenticated" && session?.user) {
      const { role, email, firstName, lastName, id } = session.user as any;
      if (role) {
        dispatch(setRole(role));
        dispatch(setUser({
          id: id || "1",
          name: firstName ? `${firstName} ${lastName || ""}` : email?.split("@")[0] || "User",
          email: email || "",
          role: role,
          organization_id: session.user.organization_id || null,
          department_id: session.user.department_id || null,
        }));
      }
    }
  }, [dispatch, session, status]);

  if (!mounted) return null;

  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-background">
        <PageTransition>{children}</PageTransition>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-background">
      <Sidebar />
      <div 
        className={cn(
          "flex flex-1 flex-col transition-all duration-500",
          sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"
        )}
      >
        <Navbar />
        <main className="flex-1 p-6 lg:p-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
