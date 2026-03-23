"use client";

import { Moon, Sun, Search, User, Menu, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { setRole } from "@/store/slices/userSlice";
import { RootState } from "@/store";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { name, role } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/60 px-4 backdrop-blur-md lg:px-8 border-border/50">
        <div className="flex w-full items-center justify-between" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/60 px-4 backdrop-blur-md lg:px-8 border-border/50">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all rounded-xl"
          >
            <Menu size={20} />
          </button>
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search everything..."
              className="h-10 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-4 text-sm transition-all focus:bg-background/80 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden xl:flex bg-muted/30 p-1 rounded-xl gap-1 border border-border/50">
            {(["INTERN", "DEPT_ADMIN", "SUPER_ADMIN"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  dispatch(setRole(r));
                  document.cookie = `session=${JSON.stringify({ role: r })}; path=/`;
                  if (r === "SUPER_ADMIN") window.location.href = "/super-admin/dashboard";
                  else if (r === "DEPT_ADMIN") window.location.href = "/admin/dashboard";
                  else window.location.href = "/profile";
                }}
                className={cn(
                  "px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all",
                  role === r 
                    ? "bg-primary text-primary-foreground shadow-lg neon-glow scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>

          <button className="relative p-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all rounded-xl group">
            <Bell size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-background neon-glow"></span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
          >
            {theme === "dark" ? <Sun size={20} className="group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform" />}
          </button>
          
          <div className="flex items-center space-x-3 border-l border-border/50 pl-4 ml-2">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-black leading-none tracking-tight">{name}</p>
              <p className="text-[10px] font-black text-primary/70 uppercase mt-1 tracking-widest">
                {role?.replace("_", " ")}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center p-1 border border-primary/20 hover:scale-105 transition-transform cursor-pointer">
              <User size={20} className="text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
