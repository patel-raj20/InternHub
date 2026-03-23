"use client";

import { usePathname } from "next/navigation";
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

  useEffect(() => {
    setMounted(true);
    
    // Sync session from cookie on mount
    const sessionCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];
      
    if (sessionCookie) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionCookie));
        if (session.role) {
          dispatch(setRole(session.role));
          if (session.email) {
            dispatch(setUser({
              id: "1",
              name: session.email.split("@")[0],
              email: session.email,
              role: session.role,
              department: "Engineering"
            }));
          }
        }
      } catch (e) {
        console.error("Failed to sync session:", e);
      }
    }
  }, [dispatch]);

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
