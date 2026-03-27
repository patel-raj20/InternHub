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
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notification and Role toggle removed */}

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
