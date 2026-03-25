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

export function ContentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isLoginPage = pathname === "/login";
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
          department: "Engineering" // Default if not in session
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
      <div className="flex flex-1 flex-col lg:pl-[260px] transition-all duration-500">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
