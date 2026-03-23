"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (role === "SUPER_ADMIN") router.push("/super-admin/dashboard");
    else if (role === "DEPT_ADMIN") router.push("/admin/dashboard");
    else router.push("/profile");
  }, [role, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent neon-glow" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Routing to Workspace...
        </p>
      </div>
    </div>
  );
}
